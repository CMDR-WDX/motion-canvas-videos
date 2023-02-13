import {makeProject} from '@motion-canvas/core/lib';

import intro from './hitPrediction/intro?scene';
import './hitPrediction/styles.css';

export default makeProject({
  scenes: [intro],
  background: '#141414',
});
