---
title: Serving Static S3 Website Over HTTPS
layout: post
permalink: /s3-static-website-https/
categories: https aws
---

If you are hosting your static website on AWS S3, serving it over HTTPS is rather trivial. Here are the steps you'll need to take:

1. [Request new certificate](#request-certificate)
2. [Create CloudFront distribution](#create-cloudfront-distribution)
3. [Point domain to CloudFront](#point-domain-a-record-to-cloudfront)


### Request certificate

Amazon provides free SSL/TLS certificates. Log in to your AWS account and go to _AWS Certificate Manager_ service. **Important: you must select us-east-1 (N. Virginia) region**. Click the _Request a certificate_ button and fill in the domain name. If your site is accessible via both www and non-www, add the following:

<img src="/img/aws-certificate-manager-domain.png" class="img-fluid" alt="AWS Certificate Manager domain" />

Next you need to select validation method. There are two options, DNS and email. I usually go with DNS because I host my domains on AWS and there is an option to automatically create a _CNAME_ DNS record. If you have a valid email associated with your domain record, you can select the email validation.

The process might take a while but after a couple of minutes you should have a newly issued certificate.

### Create CloudFront distribution

It's not possible to use certificate directly with an S3 bucket so you'll have to create a CloudFront distribution instead. Using CloudFront to serve your static content has an additional benefit of increased site speed.

Go to the _CloudFront_ service in the AWS console, click on _Create Distribution_ and under the Web section, click the _Get Started_ button. Put the URL to your S3 bucket in which you host the website files in the _Origin Domain Name_ field.

When you click on the input field you'll be give a list of your existing S3 buckets. I couldn't make it work with these predefined values but I had to copy/paste the bucket URL from the S3 service. So for my _jarospisak.com_ domain I put this bucket URL `jarospisak.com.s3-website-us-west-2.amazonaws.com`. You can get the full URL if you go to S3, click on the bucket, select _Properties_, _Static website hosting_ and copy the _endpoint_ URL.

If you configured your S3 website to redirect from non-www to www, enter your www domain in the _Alternate Domain Names (CNAMEs)_ field.

In the _Viewer Protocol Policy_ select _Redirect HTTP to HTTPS_ and in the _SSL Certificate_ select your previously created certificate. Leave all other fields untouched and click _Create Distribution_.

Go fetch a coffee and after about 15 - 30 mins your CloudFront distribution should be ready.

### Point domain A record to Cloudfront

The last step remaining is to point your domain's A-record to the CloudFront distribution URL. If you are using Route 55 this is as easy as going to your domain records and editing an existing A record. In the _Alias Target_ field you should see your CloudFront distribution. Select it and click _Save Record Set_.

Give it a few minutes, refresh your site and you'll see the green lock icon in the address bar indicating that your site is now being served over HTTPS.
