///<reference path="../../types/index.d.ts" />
///<reference path="../../types/patch.d.ts" />

/******************************************************************/
/**/ // Bootsrap
/**/ import './init'
/**/
/**/ import state from '../common/state'
/**/ import { appLogger } from './logging/loggers'
/**/
/**/ import { LOG_TRANSITION_START, LOG_TRANSITION_END } from '../common/config'
/**/
/**/ state
/**/   .on('stage', function (stage, prevStage) {
/**/     if (prevStage) {
/**/       appLogger.info(LOG_TRANSITION_END, stage)
/**/     }
/**/     appLogger.info(LOG_TRANSITION_START, stage)
/**/   })
/**/   .set('stage', 'init')
/**/
/******************************************************************/
