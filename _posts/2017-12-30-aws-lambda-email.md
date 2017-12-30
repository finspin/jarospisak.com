---
title: How to set up AWS Lambda with automated email
layout: post
permalink: /aws-lambda-email
categories: aws lambda
---

[AWS Lambda](https://aws.amazon.com/lambda/) is a service that lets you run functions on demand without worrying about the underlying infrastructure. If you have a piece of code that you run infrequently, you probably don't want to maintain a server. You can run it as a Lambda function and Amazon takes care of the rest.

In this article, I'll walk through the process of setting up your first Lambda function. I'll use my own configuration as an example. Here's what my Lambda will do:

1. Fetch jobs from [https://thehub.fi/api/jobs](https://thehub.fi/api/jobs)
2. Parse the response
3. Send me an email if there are new jobs

A simple setup but good enough to go through all the basics of AWS Lambda. On top of that, I'll use a few additional Amazon services:

- AWS CloudWatch to trigger the Lambda function
- AWS SES (Simple Email Service) to send an email notification
- AWS IAM to grant Lambda function access to AWS SES

A picture speaks a thousand words:

![AWS Lambda Example](/img/lambda-example.png)

## Step by step guide to run Lambda in AWS

### 1. Create Lambda function locally
In this example, I'm using Python but AWS Lambda supports a few other languages.

```python
import requests
import boto3
from datetime import datetime
from dateutil import parser

ses = boto3.client('ses')


def lambda_handler(event, context):
    print('Starting lambda function')

    url = 'https://thehub.fi/api/jobs?page=1'

    resp = requests.get(url=url)
    data = resp.json()

    job_message = []

    for job in data['jobs']['docs']:
        job_date = parser.parse(job['approvedAt']).date()
        if job_date == datetime.today().date():
            job_message.append('https://thehub.fi/jobs/' + job['key'] + '\n')

    email_from = 'hello@example.com'
    email_to = 'hello@example.com'
    email_subject = 'New jobs on thehub.fi'
    email_body = ''.join(job_message)

    response = ses.send_email(
        Source = email_from,
        Destination={
            'ToAddresses': [
                email_to,
            ]
        },
        Message={
            'Subject': {
                'Data': email_subject
        },
            'Body': {
                'Text': {
                    'Data': email_body
                }
            }
        }
    )
```    

Run `pip install requests -t .` to download external dependencies. We need to bundle external Python libraries with the main file. Zip everything to hub-jobs.zip.

### 2. Create new IAM role for our Lambda function

We need to assign a role to our Lambda function in order to give it permission to access other AWS services. In the AWS console go to *IAM module - Roles - Create role*. For the AWS service select Lambda and search for a policy with this name *AmazonSESFullAccess*. Review and save.

### 3. Create CloudWatch event to trigger Lambda function

In my case, I want to run the Lambda function once a day so I'll create a CloudWatch event to trigger it. In the AWS console go to *CloudWatch - Events - Roles - Create rule*. There are a couple of different ways how to create a trigger but in my case, I chose the cron expression: `0 5 ? * * *`. This will fire off every day at 5 am GMT.

### 4. Authorize email in AWS SES

Before we can run our Lambda function, we need to authorize the email used in the Python function. This is pretty straight-forward. In the AWS console go to *SES - Email addresses* and click on *Verify new email address*. You'll receive an email with the verification link.

### 5. Create Lambda function

In the AWS console go to *Lambda - Functions - Create function - Author from scratch*. Give it a name and select the following options:

- runtime Python 2.7
- handler hub-jobs.lambda_handler (name of the file [dot] name of the lambda function in the file)

In the Code entry type select *Upload .zip* and upload the zip file you created in Step 1. For the execution role choose the IAM role you created in the previous step. Increase the timeout to something like 10 seconds. That's it, click *Save*.

### 6. Test Lambda function

In the top right corner click on *Create a test event*, accept the defaults and save it. Now you can test your Lambda function by clicking the *Test* button in the top right corner. If everything goes well, you'll see a log with a green background.

Now you have your first Lambda function up and running. You can sit back, sip a glass of red wine and wait for the first automated email. And the whole setup will [cost you almost nothing](https://aws.amazon.com/lambda/pricing/).