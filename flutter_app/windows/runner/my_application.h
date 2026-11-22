#ifndef RUNNER_MY_APPLICATION_H_
#define RUNNER_MY_APPLICATION_H_

#include <flutter/dart_project.h>
#include <flutter/flutter_view_controller.h>
#include <memory>

#include "win32_window.h"

class MyApplication : public Win32Window {
 public:
  explicit MyApplication(const flutter::DartProject& project);
  virtual ~MyApplication();

 protected:
  bool OnCreate() override;
  void OnDestroy() override;
  LRESULT MessageHandler(HWND window, UINT const message, WPARAM const wparam,
                         LPARAM const lparam) noexcept override;

 private:
  flutter::DartProject project_;
  std::unique_ptr<flutter::FlutterViewController> flutter_controller_;
};

#endif  // RUNNER_MY_APPLICATION_H_
