package me.heahaidu.aws.fcj.eventservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class EventserviceApplication {

    @Value("${spring.datasource.url}")
    static String url;

	public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        System.setProperty("user.timezone", "UTC");
//        System.out.println(url);
        SpringApplication.run(EventserviceApplication.class, args);
	}

}
