import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../errors";
import { UserRecord, UserRepository } from "../repositories/userRepository";

export interface Credentials {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export class AuthService {
  constructor(private readonly users: UserRepository, private readonly jwtSecret: string) {}

  async register(input: Credentials): Promise<PublicUser> {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";

    if (!name) throw new HttpError(400, "name is required");
    if (!email.includes("@")) throw new HttpError(400, "a valid email is required");
    if (password.length < 8) throw new HttpError(400, "password must be at least 8 characters");
    if (await this.users.findByEmail(email)) throw new HttpError(409, "email already registered");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ name, email, passwordHash });
    return this.toPublic(user);
  }

  async login(input: Credentials): Promise<{ token: string; user: PublicUser }> {
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";

    const user = await this.users.findByEmail(email);
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !passwordMatches) throw new HttpError(401, "invalid email or password");

    const token = jwt.sign({ role: user.role }, this.jwtSecret, { subject: String(user.id), expiresIn: "1d" });
    return { token, user: this.toPublic(user) };
  }

  private toPublic(user: UserRecord): PublicUser {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}