# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy Solution and Project files for caching restore layer
COPY Beverage.sln ./
COPY src/Beverage.Domain/Beverage.Domain.csproj src/Beverage.Domain/
COPY src/Beverage.Application/Beverage.Application.csproj src/Beverage.Application/
COPY src/Beverage.Infrastructure/Beverage.Infrastructure.csproj src/Beverage.Infrastructure/
COPY src/Beverage.Api/Beverage.Api.csproj src/Beverage.Api/
COPY tests/Beverage.UnitTests/Beverage.UnitTests.csproj tests/Beverage.UnitTests/
COPY tests/Beverage.IntegrationTests/Beverage.IntegrationTests.csproj tests/Beverage.IntegrationTests/

RUN dotnet restore Beverage.sln

# Copy remaining source code and publish
COPY . .
WORKDIR /app/src/Beverage.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Storage & Backups volumes
RUN mkdir -p /app/storage /app/backups

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000
ENTRYPOINT ["dotnet", "Beverage.Api.dll"]

