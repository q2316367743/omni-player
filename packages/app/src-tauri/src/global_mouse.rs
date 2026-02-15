use rdev::{listen, Event, EventType, Button};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::thread;
use tauri::{AppHandle, Manager};

static mut RIGHT_CLICK_START: Option<Instant> = None;
static mut MOUSE_POSITION: (f64, f64) = (0.0, 0.0);

pub fn start_global_mouse_listener(app_handle: AppHandle) {
    thread::spawn(move || {
        let app_handle = Arc::new(Mutex::new(app_handle));
        let app_handle_clone = Arc::clone(&app_handle);

        let callback = move |event: Event| {
            match event.event_type {
                EventType::ButtonPress(button) => {
                    if button == Button::Right {
                        unsafe {
                            RIGHT_CLICK_START = Some(Instant::now());
                        }
                    }
                }
                EventType::ButtonRelease(button) => {
                    if button == Button::Right {
                        unsafe {
                            if let Some(start) = RIGHT_CLICK_START {
                                let duration = start.elapsed();
                                if duration >= Duration::from_millis(500) {
                                    let (x, y) = MOUSE_POSITION;
                                    log::info!("Right click long press detected at ({}, {})", x, y);
                                    let app = app_handle_clone.lock().unwrap();
                                    create_popup_window(&app, x, y);
                                }
                            }
                            RIGHT_CLICK_START = None;
                        }
                    }
                }
                EventType::MouseMove { x, y } => {
                    unsafe {
                        MOUSE_POSITION = (x as f64, y as f64);
                    }
                }
                _ => {}
            }
        };

        if let Err(e) = listen(callback) {
            log::error!("Global mouse listener error: {:?}", e);
        }
    });
}

fn create_popup_window(app: &AppHandle, mouse_x: f64, mouse_y: f64) {
    let window_label = "popup_main";
    
    if let Some(existing_window) = app.get_webview_window(window_label) {
        position_window(&existing_window, mouse_x, mouse_y);
        let _ = existing_window.show();
        let _ = existing_window.set_focus();
        return;
    }

    let window = tauri::WebviewWindowBuilder::new(
        app,
        window_label,
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("楼下小黑")
    .inner_size(250.0, 469.0)
    .resizable(false)
    .fullscreen(false)
    .decorations(false)
    .always_on_top(true)
    .visible(false)
    .build();

    match window {
        Ok(w) => {
            position_window(&w, mouse_x, mouse_y);
            let _ = w.show();
            let _ = w.set_focus();
            
            setup_window_focus_listener(app.clone(), window_label.to_string());
        }
        Err(e) => {
            log::error!("Failed to create popup window: {:?}", e);
        }
    }
}

fn position_window(window: &tauri::WebviewWindow, mouse_x: f64, mouse_y: f64) {
    let window_width = 250.0;
    let window_height = 469.0;

    let monitor = window.current_monitor().ok().flatten().or_else(|| {
        window.available_monitors().ok().and_then(|m| m.first().cloned())
    });

    if let Some(monitor) = monitor {
        let monitor_size = monitor.size();
        let monitor_position = monitor.position();
        let scale_factor = monitor.scale_factor();
        
        let screen_width = monitor_size.width as f64 / scale_factor;
        let screen_height = monitor_size.height as f64 / scale_factor;
        let screen_x = monitor_position.x as f64 / scale_factor;
        let screen_y = monitor_position.y as f64 / scale_factor;

        let logical_mouse_x = mouse_x / scale_factor;
        let logical_mouse_y = mouse_y / scale_factor;

        log::info!("Scale factor: {}", scale_factor);
        log::info!("Monitor: position=({}, {}), size=({}, {})", screen_x, screen_y, screen_width, screen_height);
        log::info!("Mouse position (physical): ({}, {})", mouse_x, mouse_y);
        log::info!("Mouse position (logical): ({}, {})", logical_mouse_x, logical_mouse_y);

        let mut final_x = logical_mouse_x;
        let mut final_y = logical_mouse_y;

        if final_x + window_width > screen_x + screen_width {
            final_x = logical_mouse_x - window_width;
        }

        if final_y + window_height > screen_y + screen_height {
            final_y = logical_mouse_y - window_height;
        }

        final_x = final_x.max(screen_x);
        final_y = final_y.max(screen_y);

        log::info!("Final window position: ({}, {})", final_x, final_y);

        let _ = window.set_position(tauri::Position::Logical(tauri::LogicalPosition {
            x: final_x,
            y: final_y,
        }));
    } else {
        log::warn!("No monitor found, using mouse position directly");
        let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: mouse_x as i32,
            y: mouse_y as i32,
        }));
    }
}

fn setup_window_focus_listener(app_handle: AppHandle, window_label: String) {
    if let Some(window) = app_handle.get_webview_window(&window_label) {
        window.on_window_event(move |event| {
            if let tauri::WindowEvent::Focused(is_focused) = event {
                if !is_focused {
                    if let Some(w) = app_handle.get_webview_window(&window_label) {
                        let _ = w.hide();
                    }
                }
            }
        });
    }
}
