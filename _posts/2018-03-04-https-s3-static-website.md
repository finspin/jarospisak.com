---
title: Serving Static S3 Website Over HTTPS
layout: post
permalink: /s3-static-website-https/
categories: https aws
---

If you are hosting your static website on AWS S3, serving it over HTTPS is quite easy with AWS services. In this article I'll describe step by step how to do it and I'll make the following assumptions:

1. You are already hosting your site on S3 bucket. You have two buckets, one for the `www` and one for the `non-www` version of your site. The `non-www` bucket is configured to redirect to the `www` bucket (you host the actual files in this bucket).
2. You use Route53 for your domain configuration
3. You want to redirect all requests to `https://www.domain.com`, for example:
   - `jarospisak.com` &rarr; `https://www.jarospisak.com`
   - `www.jarospisak.com` &rarr; `https://www.jarospisak.com`
   - `https://jarospisak.com` &rarr; `https://www.jarospisak.com`

## Step by step guide

1. [Request new certificate](#1-request-certificate)
2. [Create CloudFront distributions](#2-create-cloudfront-distributions)
   - [Create CloudFront distribution for www domain](#create-cloudfront-distribution-for-www-domain)
   - [Create CloudFront distribution for non-www domain](#create-cloudfront-distribution-for-non-www-domain)
3. [Point domains to CloudFront](#3-point-domains-a-records-to-cloudfront)
   - [Create A record for www domain](#create-a-record-for-www-domain)
   - [Create A record for non-www domain](#create-a-record-for-non-www-domain)


### 1. Request certificate

If you want to serve your website over HTTPS you'll need a certificate. Amazon provides free SSL/TLS certificates. Log in to your AWS account and go to _AWS Certificate Manager_ service. **Important: you must select us-east-1 (N. Virginia) region**. Click the _Request a certificate_ button and fill in the domain name. If your site is accessible via both www and non-www, add the following:

<img src="/img/aws-certificate-manager-domain.png" class="img-fluid screenshot" alt="AWS Certificate Manager domain" />

Next you need to select validation method. There are two options, DNS and email. I usually go with DNS because I host my domains on AWS and there is an option to automatically create a _CNAME_ DNS record. If you have a valid email associated with your domain record, you can select the email validation.

The process might take a while but after a couple of minutes you should have a newly issued certificate.

### 2. Create CloudFront distributions

It's not possible to use certificate directly with an S3 bucket so you'll have to create CloudFront distributions. Using CloudFront to serve your static content has an additional benefit of increased site speed. Your static site will be served from a CloudFront location which is closest to the user. 

In order to get the `www` to `non-www` redirect working over HTTPS, you'll need to **create two CloudFront distributions**, one for each domain.

#### Create CloudFront distribution for www domain

Go to the _CloudFront_ service in the AWS console, click on _Create Distribution_ and under the Web section, click the _Get Started_ button. In the _Origin Domain Name_ field enter the URL of the `www` S3 bucket (the one in which you host the website files).

When you click on the input field you'll see a list of your existing S3 buckets. Don't select the pre-generated values, instead copy/paste the bucket web URL from the S3 service. You can get the full URL if you go to S3, click on the bucket, select _Properties_, _Static website hosting_ and copy the _endpoint_ URL.

In the _Viewer Protocol Policy_ select _Redirect HTTP to HTTPS_. 

<img src="/img/cloudfront-distribution-1.png" class="img-fluid screenshot" alt="AWS CloudFront Distribution Settings" />

Enter your `www` domain name in the _Alternate Domain Names (CNAMEs)_ field and in the _SSL Certificate_ select your previously created certificate. Leave all other fields untouched and click _Create Distribution_.

<img src="/img/cloudfront-distribution-2.png" class="img-fluid screenshot" alt="AWS CloudFront Distribution Settings" />

#### Create CloudFront distribution for non-www domain

Follow the same steps as in the `www` distribution, except for the _Origin Domain Name_, enter the URL of your `non-www` version of the S3 bucket (`http://jarospisak.com.s3-website-us-west-2.amazonaws.com`).

Go fetch a coffee and after 15 - 30 mins your CloudFront distribution should be ready.

### 3. Point domain's A records to CloudFront

The last step is to point your domain's A-records to the CloudFront distributions, one for each version of your domain - `www` and `non-www`.

#### Create A record for www domain

Go to _Route 53_ - _Hosted zones_ and click on your domain. Select _Create Record Set_. Enter _www_ to the _Name_ field.  In the _Type_ select _A - IPv4 address_ and in the _Alias_ field select _Yes_ and from the _Alias Target_ select the CloudFront distribution. Click _Create_.to _Route 53_ - _Hosted zones_ and click on your domain. Select _Create Record Set_ and in the _Type_ select _A - IPv4 address_. In the _Alias_ field select _Yes_ and from the _Alias Target_ select the CloudFront distribution. Click _Create_.

<img src="/img/aws-route-53-a-records.png" class="img-fluid screenshot" alt="AWS Route 53 A records" />

#### Create A record for non-www domain

Follow the same steps and for the `www` record, except leave the _Name_ field empty.

Give it a few minutes, refresh your browser and you'll see the green lock icon in the address bar indicating that your site is now being served over HTTPS. Test that all redirections are working correctly.
