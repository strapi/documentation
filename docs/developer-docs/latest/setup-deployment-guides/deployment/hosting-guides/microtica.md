---
title: Microtica Deployment - Strapi Developer Docs
description: How to deploy your Strapi application on AWS using Microtica.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/microtica.html
---

# Microtica

This a step-by-step guide on how to deploy Strapi on your AWS account using [Microtica](https://microtica.com).

Microtica is a developer self-service platform that helps developers and ops teams with cloud infrastructure setup and app deployment in minutes.

Using Microtica for your Strapi projects gives you simplicity of setup and low maintenance, while having the infrastructure on your own AWS account. Strapi can coexist with your existing AWS infrastructure and you can always extend this setup with additional cloud resources.

::: note
Microtica’s default version of the Strapi component is v4.

If you want to use a previous version of Strapi, go to step [Deploy Strapi Infrastructure](#deploy-strapi-infrastructure).
:::

## What will be provisioned on AWS
Microtica's pre-made Strapi template will create a new environment and automatically create a few components in the environment:

* **VPC** – VPC, subnets and networking.
* **AppRunner** – Container infrastructure based on Fargate and application load balancer. This component will run the Strapi project.
* **StrapiInfra** – Persistent storage, relational databased and S3 storage.
* **StrapiApp** (optional) – component for your existing Strapi project. If not provided, a standalone Strapi development environment is created.

### Persistent Storage
The Strapi template uses an Amazon EFS file system to store the persistent Strapi files:

* image uploads – media files storage
* API folder – only for the standalone setup where the source code is not connected via git (default). This guide explains how to deploy an existing Strapi project.
* data folder – store the sqlite data file, if database client is `sqlite` (default)

The data stored in these folders will persist on subsequent deployments, application restarts or even if you kill the container completely.


### Relational Database
The template provisions an RDS MySql database only if the database client is `mysql`.

The database is encrypted using a custom KMS key. Database password is automatically generated and stored securely in a AWS Secret Manager secret.

### Container Environment
By default, the template provisions an AWS Fargate cluster with one container. For production environments we recommend at least two containers running all the time. This will also ensure a zero-downtime deployment.

The Fargate services is exposed via Application Load Balancer. When using custom domain, which is recommended for production, the domain certificate will be attached and SSL termination will happen on this load balancer.

Since we use persistent file storage, all containers share the same file system.

### Strapi Logs
The Strapi application logs are stored in a CloudWatch Logs. You can monitor the logs from the Fargate console under tasks. The default log retention is 90 days.

## Deploy Strapi Infrastructure
Microtica provides a built-in environment template that provisions the necessary infrastructure to run Strapi on your AWS account in a scalable, secure and reliable way with zero downtime deployment.

### 1. Create a Microtica Account
Go to [Microtica Portal](https://portal.microtica.com/register) to create an account, if you don't have one already. 

### 2. Create a project
Click on _Create project_ and add the information for your project.

### 3. Create an environment 
Choose _Environments_ under _Infrastructure Builder_ from the main menu and hit on [Create Environment](https://portal.microtica.com/environments/create?template=strapi).

Enter the environment name and description, choose AWS as cloud provider and Cloudformation as IaC tool. Then select the **Strapi template** card.

::: note
You can optionally enable Cost Optimization for non-production environments. This will stop the RDS instances if you use `mysql` as database client.
:::

### 4. Select a Strapi version (optional)
Microtica uses Strapi v4 as a default version for the `StrapiInfra` component. If you want to use a previous Strapi version, configure the `StrapiInfra` component’s imageUrl parameter with `microtica/strapi:v3.6.2`.

### 5. Deploy the environment
To deploy the environment click the _Quick Deploy_ button. Since the environment is new, you need to configure the target AWS account where your Strapi infrastructure will be provisioned. Here is a quick guide [How to Connect your AWS account](https://microtica.com/docs/connect-aws-account/).

Once your AWS account is connected and configured in the environment, click again on _Quick Deploy_ to trigger the deployment.

**It takes up to 10 mins** to create a live Strapi environment.

Once the environment deployment finishes, you can find the access URL in the environment details by expanding the `AppRunner` component.


## Configure a Custom Domain and SSL
By default, Strapi will be available on an auto-generated domain via http protocol.

To configure a custom domain you would need to do the following:

### 1. Configure the custom domain
To configure the custom domain, simply enter the custom domain in the `AppRunner` component `DomainName` parameter.

### 2. Configure the SSL certificate
To create an SSL certificate follow the [How to create SSL certificate guide](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html).

Once you have your issued SSL certificate through AWS Certificate Manager you just need to copy the certificate ARN and past it in the `AppRunner` component `CertificateArn` parameter.

### 3. Add the DNS records in your domain provider
While in the environment details, expand the `AppRunner` component and copy the value of the CNAME parameter and add it as a `CNAME` record in your DNS provider.

## Scaling
You can scale your Strapi project vertically and horizontally.

For vertical scaling, update the CPU and Memory configuration in the `StrapiInfra` component. For horizontal scaling, update the number of desired replicas in the same `StrapiInfra` component.

## Deploy an Existing Strapi Project
For production environments we recommend using Git for your Strapi projects. This also makes the process of moving content types from one environment to another much easier and deployments more predictable.
Here is a guide on [how to deploy your existing Strapi project on AWS](https://microtica.com/docs/deploy-strapi-on-aws/#deploy-an-existing-strapi-project). 
