package com.aws.configs;

import com.aws.filters.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;


@Configuration
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/user/auth/login").permitAll()
                        .requestMatchers("/api/v1/user/secure/profile").permitAll()
                        .requestMatchers("/api/v1/user/register/account").permitAll()
                        .requestMatchers("/api/v1/user/register/verify-email").permitAll()
                        .requestMatchers("/api/v1/user/page-update").permitAll()
                        .requestMatchers("/api/v1/user/page-delete/**").permitAll()
                        .requestMatchers("/api/v1/user/page-detail/**").permitAll()
                        .requestMatchers("/api/v1/user/page/owner/**").permitAll()
                        .requestMatchers("/api/v1/user/pages/**").permitAll()
                        .requestMatchers("/api/v1/user/page-member-update").permitAll()
                        .requestMatchers("/api/v1/user/page-member-delete/**").permitAll()
                        .requestMatchers("/api/v1/user/page-member/**").permitAll()
                        .requestMatchers("/api/v1/user/page-members/**").permitAll()
                        .requestMatchers("/api/v1/user/page-follower-update").permitAll()
                        .requestMatchers("/api/v1/user/page-follower-delete/**").permitAll()
                        .requestMatchers("/api/v1/user/page-follower/**").permitAll()
                        .requestMatchers("/api/v1/user/page-followers/**").permitAll()
                        .requestMatchers("/actuator/health/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
