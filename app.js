import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
const app = express()
import rateLimit from "express-rate-limit"
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import cors from 'cors'

// Rate limiting










//routes


export default app