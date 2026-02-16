import { IUser } from '../modules/auth/user.model.js';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            userId?: string;
        }
    }
}
