FROM node:22-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup

COPY package*.json ./

RUN npm install --no-audit --no-fund

COPY --chown=appuser:appgroup . .

RUN mkdir -p /app/.next \
    && chown -R appuser:appgroup /app/.next

RUN mkdir -p /app/.next
RUN chown -R appuser:appgroup /app/.next

USER appuser

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]