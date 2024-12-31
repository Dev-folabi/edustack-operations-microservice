import { NextFunction, Request, Response } from "express";
import { classSchoolRequest } from "../types/request";
import { makeAuthRequest } from "../services/edustack";
import { getTokenFromHeader } from "../functions/token";
import { handleError } from "../error/errorHandler";
import prisma from "../prisma";

export const createClass = async (
  req: Request<{}, {}, classSchoolRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromHeader(req);
    const { label, section, school_id } = req.body;

    // Validate and deduplicate school IDs
    const uniqueSchoolIds = [...new Set(school_id)];
    const invalidSchoolIds: string[] = [];

    // Validate school existence
    for (const sch of uniqueSchoolIds) {
      try {
        const school = await makeAuthRequest({
          endpoint: `school/${sch}`,
          method: "GET",
          token,
        });

        // Check if school exists in response
        if (!school.data || !school.data.some((s: string) => s === sch)) {
          invalidSchoolIds.push(sch);
        }
      } catch (error) {
        return handleError(
          res,
          `Error fetching school details for ID: ${sch}`,
          500
        );
      }
    }

    if (invalidSchoolIds.length > 0) {
      return handleError(
        res,
        `Invalid school IDs: ${invalidSchoolIds.join(", ")}`,
        400
      );
    }

    // Create class and associate it with schools
    const result = await prisma.$transaction(async (tx) => {
      // Create the class
      const createdClass = await tx.classes.create({
        data: { label, section },
      });

      // Create associations with schools
      const schoolClassData = uniqueSchoolIds.map((id) => ({
        class_id: createdClass.id,
        school_id: id,
      }));

      await tx.school_Class.createMany({
        data: schoolClassData,
      });

      return createdClass;
    });

    // Success response
    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get All Classes
export const getAllClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const classes = await prisma.classes.findMany();
    res.status(200).json({
      success: true,
      message: "All classes retrieved successfully",
      data: classes,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get Class by ID
export const getClassById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const classId = req.params.id;

    const foundClass = await prisma.classes.findUnique({
      where: { id: classId },
    });

    if (!foundClass) {
      return handleError(res, "Class not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Class retrieved successfully",
      data: foundClass,
    });
  } catch (error: any) {
    next(error);
  }
};

// Update Class
export const updateClass = async (
  req: Request<{ id: string }, {}, Partial<classSchoolRequest>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: classId } = req.params;
    const { label, section, school_id } = req.body;

    // Fetch existing class and its associated schools
    const existingClass = await prisma.classes.findUnique({
      where: { id: classId },
      include: { school_class: true },
    });

    if (!existingClass) {
      return handleError(res, "Class not found", 404);
    }

    const existingSchoolIds = existingClass.school_class.map(
      (sc) => sc.school_id
    );
    const uniqueSchoolIds = [...new Set(school_id ?? [])];

    // Validate the provided school IDs
    const token = getTokenFromHeader(req);
    const invalidSchoolIds: string[] = [];
    for (const sch of uniqueSchoolIds) {
      try {
        const school = await makeAuthRequest({
          endpoint: `school/${sch}`,
          method: "GET",
          token,
        });

        if (!school.data || !school.data.some((s: string) => s === sch)) {
          invalidSchoolIds.push(sch);
        }
      } catch (error) {
        return handleError(
          res,
          `Error fetching school details for ID: ${sch}`,
          500
        );
      }
    }

    if (invalidSchoolIds.length > 0) {
      return handleError(
        res,
        `Invalid school IDs: ${invalidSchoolIds.join(", ")}`,
        400
      );
    }

    // Determine schools to add and remove
    const schoolsToAdd = uniqueSchoolIds.filter(
      (id) => !existingSchoolIds.includes(id)
    );
    const schoolsToRemove = existingSchoolIds.filter(
      (id) => !uniqueSchoolIds.includes(id)
    );

    // Update class and school associations
    const updatedClass = await prisma.$transaction(async (tx) => {
      // Update class details
      const updated = await tx.classes.update({
        where: { id: classId },
        data: {
          label: label ?? existingClass.label,
          section: section ?? existingClass.section,
        },
      });

      // Add new school associations
      if (schoolsToAdd.length > 0) {
        await tx.school_Class.createMany({
          data: schoolsToAdd.map((schoolId) => ({
            class_id: classId,
            school_id: schoolId,
          })),
        });
      }

      // Remove outdated school associations
      if (schoolsToRemove.length > 0) {
        await tx.school_Class.deleteMany({
          where: {
            class_id: classId,
            school_id: { in: schoolsToRemove },
          },
        });
      }

      return updated;
    });

    // Success response
    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error: any) {
    next(error);
  }
};

// Delete Class
export const deleteClass = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const classId = req.params.id;

    const existingClass = await prisma.classes.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return handleError(res, "Class not found", 404);
    }

    // Delete associated relationships first, if applicable
    await prisma.school_Class.deleteMany({
      where: { class_id: classId },
    });

    await prisma.classes.delete({
      where: { id: classId },
    });

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};
