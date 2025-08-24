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
    logger.error("GameNotFoundException occurred: {}", ex.getMessage(), ex);
    logger.debug("Request details - URI: {}, Parameters: {}",
        request.getDescription(false),
        request.getParameterMap());

    return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND, "GAME_NOT_FOUND");
  }

  @ExceptionHandler(InvalidActionException.class)
  @ResponseBody
  public ResponseEntity<Map<String, Object>> handleInvalidAction(InvalidActionException ex, WebRequest request) {
    logger.warn("InvalidActionException occurred: {}", ex.getMessage(), ex);
    logger.debug("Request details - URI: {}, Parameters: {}",
        request.getDescription(false),
        request.getParameterMap());

    return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, "INVALID_ACTION");
  }

  @ExceptionHandler(InvalidMoveException.class)
  @ResponseBody
  public ResponseEntity<Map<String, Object>> handleInvalidMove(InvalidMoveException ex, WebRequest request) {
    logger.warn("InvalidMoveException occurred: {}", ex.getMessage(), ex);
    logger.debug("Request details - URI: {}, Parameters: {}",
        request.getDescription(false),
        request.getParameterMap());

    return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, "INVALID_MOVE");
  }

  @ExceptionHandler(Exception.class)
  @ResponseBody
  public ResponseEntity<Map<String, Object>> handleOtherExceptions(Exception ex, WebRequest request) {
    logger.error("Unexpected exception occurred: {} - {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
    logger.error("Request details - URI: {}, Parameters: {}",
        request.getDescription(false),
        request.getParameterMap());
    logger.error("Full stack trace:", ex);

    return buildResponse(
        "Unknown server side error occurred. Please try again.",
        HttpStatus.INTERNAL_SERVER_ERROR,
        "INTERNAL_SERVER_ERROR");
  }

  private ResponseEntity<Map<String, Object>> buildResponse(String message, HttpStatus status, String errorCode) {
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", status.value());
    body.put("error", status.getReasonPhrase());
    body.put("errorCode", errorCode);
    body.put("message", message);

    logger.info("Returning error response - Status: {}, Code: {}, Message: {}",
        status.value(), errorCode, message);

    return new ResponseEntity<>(body, status);
  }

  // Overloaded method for backward compatibility
  private ResponseEntity<Map<String, Object>> buildResponse(String message, HttpStatus status) {
    return buildResponse(message, status, "GENERIC_ERROR");
  }
}
