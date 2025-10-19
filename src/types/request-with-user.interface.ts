
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.interface'; // Ajusta la ruta

export interface RequestWithUser extends Request {
  user: JwtPayload; 
}