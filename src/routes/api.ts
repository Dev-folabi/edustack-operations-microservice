import express from 'express'
import classRoutes from "./classRoutes"
import { verifyToken } from '../middlewares/tokenVerify';
const router = express.Router()

router.use("/class", verifyToken, classRoutes)
export default router;