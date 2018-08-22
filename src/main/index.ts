/******************************************************************/
/**/ // Bootsrap
/**/ import './init'
/**/
/**/ import state from '../common/state'
/**/ import { mainLogger } from './logging/loggers'
/**/
/**/ import { LOG_TRANSITION_START, LOG_TRANSITION_END } from '../common/config'
/**/
/**/ state
/**/   .on('stage', function (stage, prevStage) {
/**/     if (prevStage) {
/**/       mainLogger.info(LOG_TRANSITION_END, stage)
/**/     }
/**/     mainLogger.info(LOG_TRANSITION_START, stage)
/**/   })
/**/   .set('stage', 'init')
/**/
/******************************************************************/

import { app, BrowserWindow } from 'electron'

import { IS_DEV } from './env'

function createWindow () {
  let window: BrowserWindow | null = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    }
  })

  if (process.env.ELECTRON_WEBPACK_WDS_PORT) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    window.loadFile(IS_DEV ? 'dist/renderer/index.html' : 'index.html')
  }

  if (IS_DEV) {
    window.webContents.openDevTools({
      mode: "undocked"
    })
  }

  window.on('closed', () => {
    window = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  app.quit()
})
