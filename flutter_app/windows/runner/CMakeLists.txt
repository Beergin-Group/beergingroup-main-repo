cmake_minimum_required(VERSION 3.14)
project(runner LANGUAGES CXX)

# Define the application target
add_executable(${BINARY_NAME} WIN32
  "main.cpp"
  "my_application.cpp"
  "my_application.h"
  "win32_window.cpp"
  "win32_window.h"
  "utils.cpp"
  "utils.h"
  "Runner.rc"
  "resource.h"
)

# Apply preprocessor definitions
target_compile_definitions(${BINARY_NAME} PRIVATE
  $<$<CONFIG:Debug>:DEBUG>
  _UNICODE
  UNICODE
)

target_include_directories(${BINARY_NAME} PRIVATE
  "${CMAKE_CURRENT_SOURCE_DIR}"
)

# Set Windows executable properties
set_target_properties(${BINARY_NAME} PROPERTIES
  OUTPUT_NAME "mediremind"
)
