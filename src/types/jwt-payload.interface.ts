export interface JwtPayload {
  sub: number;
  nombres:string;
  correo: string;
  iat?: number;
  exp?: number;
}
