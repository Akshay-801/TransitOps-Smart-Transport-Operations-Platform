package com.transitops.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping(value = "/", produces = MediaType.TEXT_PLAIN_VALUE)
    public String home() {
        return "TransitOps backend is running. Use /api/health to check status and /api/auth/* for auth APIs.";
    }

    @GetMapping(value = "/api/health", produces = MediaType.TEXT_PLAIN_VALUE)
    public String health() {
        return "ok";
    }
}