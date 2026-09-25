import { prisma } from "../common/prisma.js";
import { DevLogOtpProvider } from "../common/providers/otp/dev-log-otp-provider.js";
import { DevLogEmailProvider } from "../common/providers/email/dev-log-email-provider.js";
import { createTokenService } from "./token.service.js";
import { createAuthModel } from "./auth.model.js";
import { createAuthService } from "./auth.service.js";
import { createAuthRoutes } from "./auth.routes.js";

// Builds the auth module end-to-end. tokenService/otpProvider/
// emailProvider are auth-specific infra — nothing else in the app needs
// them — so they're constructed here rather than threaded in from app.js.
export function createAuthModule({ config }) {
  const model = createAuthModel(prisma);
  const tokenService = createTokenService({
    jwtSecret: config.JWT_SECRET,
    jwtRefreshSecret: config.JWT_REFRESH_SECRET,
  });
  const otpProvider = new DevLogOtpProvider();
  const emailProvider = new DevLogEmailProvider();
  const service = createAuthService({
    repository: model,
    tokenService,
    otpProvider,
    emailProvider,
    webOrigin: config.WEB_ORIGIN,
  });
  const router = createAuthRoutes({ authService: service, config });
  return { router, service };
}
