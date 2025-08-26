package com.example.Ludo.metadata.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(GameNotFoundException.class)
  @ResponseBody
  public ResponseEntity<Map<String, Object>> handleGameNotFound(GameNotFoundException ex, WebRequest request) {
    System.out.println("❌ [GlobalExceptionHandler] === GAME NOT FOUND EXCEPTION ===");
    System.out.println("❌ [GlobalExceptionHandler] Error: " + ex.getMessage());
    System.out.println("❌ [GlobalExceptionHandler] Request URI: " + request.getDescription(false));
    System.out.println("❌ [GlobalExceptionHandler] Request Parameters: " + request.getParameterMap());

    logger.error("GameNotFoundException occurred: {}", ex.getMessage(), ex);
    logger.debug("Request details - URI: {}, Parameters: {}",
        request.getDescription(false),
        request.getParameterMap());

    ResponseEntity<Map<String, Object>> response = buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND, "GAME_NOT_FOUND");
    System.out.println("❌ [GlobalExceptionHandler] Returning NOT_FOUND response");
    return response;
  }

  @ExceptionHandler(InvalidActionException.class)
  @ResponseBody
  public ResponseEntity<Map<String, Object>> handleInvalidAction(InvalidActionException ex, WebRequest request) {
    System.out.println("❌ [GlobalExceptionHandler] === INVALID ACTION EXCEPTION ===");
    System.out.println("❌ [GlobalExceptionHandler] Error: " + ex.getMessage());
    System.out.println("❌ [GlobalExceptionHandler] Request URI: " + request.getDescription(false));
    System.out.println("❌ [GlobalExceptionHandler] Request Parameters: " + request.getParameterMap());

    logger.warn("InvalidActionException occurred: {}", ex.getMessage(), ex);
    logger.debug("Request details - URI: {}, Parameters: {}",
        request.getDescription(false),
        request.getParameterMap());

    ResponseEntity<Map<String, Object>> response = buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, "INVALID_ACTION");
    System.out.println("❌ [GlobalExceptionHandler] Returning BAD_REQUEST response");
    return response;
  }

  @ExceptionHandler(InvalidMoveException.class)
  @ResponseBody
  public ResponseEntity<Map<String, Object>> handleInvalidMove(InvalidMoveException ex, WebRequest request) {
    System.out.println("❌ [GlobalExceptionHandler] === INVALID MOVE EXCEPTION ===");
    System.out.println("❌ [GlobalExceptionHandler] Error: " + ex.getMessage());
    System.out.println("❌ [GlobalExceptionHandler] Request URI: " + request.getDescription(false));
    System.out.println("❌ [GlobalExceptionHandler] Request Parameters: " + request.getParameterMap());

    logger.warn("InvalidMoveException occurred: {}", ex.getMessage(), ex);
    logger.debug("Request details - URI: {}, Parameters: {}",
        request.getDescription(false),
        request.getParameterMap());

    ResponseEntity<Map<String, Object>> response = buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, "INVALID_MOVE");
    System.out.println("❌ [GlobalExceptionHandler] Returning BAD_REQUEST response");
    return response;
  }

  @ExceptionHandler(Exception.class)
  @ResponseBody
  public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex, WebRequest request) {
    System.out.println("❌ [GlobalExceptionHandler] === GENERAL EXCEPTION ===");
    System.out.println("❌ [GlobalExceptionHandler] Exception Type: " + ex.getClass().getSimpleName());
    System.out.println("❌ [GlobalExceptionHandler] Error: " + ex.getMessage());
    System.out.println("❌ [GlobalExceptionHandler] Request URI: " + request.getDescription(false));
    System.out.println("❌ [GlobalExceptionHandler] Request Parameters: " + request.getParameterMap());

    logger.error("Unexpected exception occurred: {}", ex.getMessage(), ex);
    logger.debug("Request details - URI: {}, Parameters: {}",
        request.getDescription(false),
        request.getParameterMap());

    ResponseEntity<Map<String, Object>> response = buildResponse("An unexpected error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");
    System.out.println("❌ [GlobalExceptionHandler] Returning INTERNAL_SERVER_ERROR response");
    return response;
  }

  private ResponseEntity<Map<String, Object>> buildResponse(String message, HttpStatus status, String errorCode) {
    System.out.println("🔧 [GlobalExceptionHandler] Building error response - Status: " + status + ", Code: " + errorCode);

    Map<String, Object> response = new HashMap<>();
    response.put("timestamp", LocalDateTime.now());
    response.put("status", status.value());
    response.put("error", status.getReasonPhrase());
    response.put("message", message);
    response.put("errorCode", errorCode);

    System.out.println("📊 [GlobalExceptionHandler] Response built: " + response);
    return new ResponseEntity<>(response, status);
  }

  // Overloaded method for backward compatibility
  private ResponseEntity<Map<String, Object>> buildResponse(String message, HttpStatus status) {
    return buildResponse(message, status, "GENERIC_ERROR");
  }
}
