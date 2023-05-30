# TiltViewer README

## Features

Allows you to run and monitor your Tilt stack from vscode.

The following hotkeys are available to quickly spin up and tear down your Tilt stack:

- `Cmd+Shift+Up`: runs `tilt up` to spin up your stack with your tilt file.
- `Cmd+Shift+Down`: runs `tilt down` to tear down your stack with your tilt file.

## Requirements

You will need `tilt` installed. You will also need any tilt dependencies such as docker etc.

## Extension Settings

This extension contributes the following settings:

- `tiltviewer.filePath`: The path to your Tiltfile.

## Known Issues

There is no way of knowing if the terminal command was successful. If you see errors in your terminal you can correct them there and re-run `tilt up` again.

## Release Notes

### 0.0.1

Beta release...There will be bugs!
