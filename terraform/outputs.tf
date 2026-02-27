output "api_gateway_endpoint" {
  value = aws_apigatewayv2_api.api_gateway.api_endpoint
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.web_distribution.domain_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.web_distribution.id
}