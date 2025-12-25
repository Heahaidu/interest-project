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
    public JwtFilter jwtFilter() {
        return new JwtFilter();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/secure/profile").permitAll()
                        .requestMatchers("/api/register/account").permitAll()
                        .requestMatchers("/api/user/verify-email").permitAll()
                        .requestMatchers("/api/page-update").permitAll()
                        .requestMatchers("/api/page-delete/**").permitAll()
                        .requestMatchers("/api/page-detail/**").permitAll()
                        .requestMatchers("/api/page/owner/**").permitAll()
                        .requestMatchers("/api/pages/**").permitAll()
                        .requestMatchers("/api/page-member-update").permitAll()
                        .requestMatchers("/api/page-member-delete/**").permitAll()
                        .requestMatchers("/api/page-member/**").permitAll()
                        .requestMatchers("/api/page-members/**").permitAll()
                        .requestMatchers("/api/page-follower-update").permitAll()
                        .requestMatchers("/api/page-follower-delete/**").permitAll()
                        .requestMatchers("/api/page-follower/**").permitAll()
                        .requestMatchers("/api/page-followers/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); // Cho phép tất cả origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
