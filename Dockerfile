# # Use the official Node.js 16 image as the base image
# FROM node:16

# # Set the working directory to /app
# WORKDIR /app

# # Install the Node Version Manager (NVM)
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# # Install the latest version of Node.js using NVM
# RUN /bin/bash -c "source $HOME/.nvm/nvm.sh && nvm install node"

# # Install unzip
# RUN apt-get update && apt-get install -y unzip

# # Install Bun
# RUN curl -fsSL https://bun.sh/install | bash

# # Install PostgreSQL
# RUN apt-get update && apt-get install -y postgresql

# # Switch to the postgres user and create a new superuser
# USER postgres
# RUN createuser --superuser --createdb --createrole --no-password docker

# # Switch back to the root user and create a new database
# USER root
# RUN service postgresql start && \
#     sudo -u postgres psql -c "CREATE DATABASE docker" && \
#     sudo -u postgres psql -c "ALTER DATABASE docker OWNER TO docker"

# # Set the environment variables for PostgreSQL
# ENV POSTGRES_USER=docker
# ENV POSTGRES_PASSWORD=docker
# ENV POSTGRES_DB=docker

# # Expose the PostgreSQL port
# EXPOSE 5432

# # Copy the application code to the container
# COPY . .

# # Install the application dependencies
# RUN npm install

# # Set the environment variable for Bun
# ENV BUN_ENV=dev

# # Start the PostgreSQL service and run the application
# CMD service postgresql start && bun run dev