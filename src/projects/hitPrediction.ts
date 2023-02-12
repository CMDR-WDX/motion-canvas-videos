import {makeProject} from '@motion-canvas/core/lib';

import scene from './hitPrediction/main?scene';

export default makeProject({
  scenes: [scene],
  background: '#141414',
});
