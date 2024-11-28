# Stage 1: Build
FROM node:18.17.1-alpine AS builder

# Update and install necessary packages
RUN apk update && apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Set up pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy the application code
COPY . .

# Install dependencies and build the application
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Stage 2: Run
FROM node:18.17.1-alpine AS runner

# Set working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app ./

# Expose the port for the application
EXPOSE 3000

# Set the environment variable for production
ENV NODE_ENV=production

# Command to start the production server
CMD ["pnpm", "start"]