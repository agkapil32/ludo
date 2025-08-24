package com.example.Ludo.metadata.core.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SignalController {

  @PostMapping("/callBackURL")
  public String getMethod(@RequestBody String s) {

    System.out.println(s);
    return s;
  }
}
