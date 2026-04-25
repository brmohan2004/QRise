import { NextResponse } from "next/server";

export class ApiResponse {
  static ok<T>(data: T, status: number = 200) {
    return NextResponse.json({ data }, { status });
  }

  static error(message: string, status: number = 500) {
    return NextResponse.json({ error: message }, { status });
  }

  static paginated<T>(items: T[], nextCursor: string | null, total: number) {
    return NextResponse.json({
      items,
      nextCursor,
      total,
    });
  }

  static unauthorized(message: string = "Unauthorized") {
    return this.error(message, 401);
  }

  static forbidden(message: string = "Forbidden") {
    return this.error(message, 403);
  }

  static notFound(message: string = "Not found") {
    return this.error(message, 404);
  }

  static badRequest(message: string = "Bad request") {
    return this.error(message, 400);
  }

  static noContent() {
    return new NextResponse(null, { status: 204 });
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return String(error);
  }
}
