---
title: How to point subdomain to EC2 instance in Route 53 
layout: post
permalink: /aws-route53-point-subdomain-to-ec2
categories: aws
---

This is a step-by-step guide on how to create a subdomain in Route 53 and point it to an EC2 instance.

### Create hosted zone for subdomain

1. Go to Route 53 - Hosted zones
2. Create hosted zone for subdomain, e.g. ci.example.com
3. Note down the NS records
4. Go to example.com hosted zone and create a new record set:
    - Name: ci.example.com
    - Type: NS - Name server
    - Value: paste the records from step #3
5. Go to ci.example.com hosted zone and create a new record set:
    - Name: leave empty (ci.example.com)
    - Type: A - IPv4
    - Value: public IP of the EC2 instance