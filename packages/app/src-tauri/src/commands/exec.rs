use std::process::Command;

pub fn run_output(program: &str, args: &[&str]) -> Result<std::process::Output, String> {
    Command::new(program)
        .args(args)
        .output()
        .map_err(|e| format!("run {program} failed: {e}"))
}

pub fn run_command(program: &str, args: &[&str]) -> Result<String, String> {
    let out = run_output(program, args)?;
    if !out.status.success() {
        let code = out.status.code().unwrap_or(-1);
        let stderr = String::from_utf8_lossy(&out.stderr);
        return Err(format!("{program} exited {code}: {stderr}"));
    }
    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}

