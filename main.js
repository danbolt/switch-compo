const {app, BrowserWindow, Menu, MenuItem, globalShortcut, dialog} = require('electron');
const nativeImage = require('electron').nativeImage;
const url = require('url');
const path = require('path');

let createWindow = function() {
  let winIcon = nativeImage.createFromPath(path.join(__dirname,'icon.png'));
  let win = new BrowserWindow({width: 800, height: 600, icon: winIcon});
  win.setAutoHideMenuBar(true);
  win.setMenuBarVisibility(false);

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Options',
      submenu: [
        {
          label: 'Toggle Fullscreen',
          sublabel: 'Alt-Enter',
          click: () => {
            win.setFullScreen(!(win.isFullScreen()));
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
          {
              label: 'About ...',
              click: () => {
                  dialog.showMessageBox(win, { butons: ['OK'], icon: winIcon, title: 'Spectres of the Cold', message: '©Copyright 2018\nDaniel Savage and Jesse Taylor\n\nhttps://danbolt.itch.io/' });
              }
          }
      ]
    },
  ];
  let topMenu = Menu.buildFromTemplate(menuTemplate);
  win.setMenu(topMenu);

  globalShortcut.register('Alt+Enter', () => {
            win.setFullScreen(!(win.isFullScreen()));
          });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
};

app.on('ready', createWindow);