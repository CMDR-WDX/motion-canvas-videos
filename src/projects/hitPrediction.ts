import {makeProject} from '@motion-canvas/core/lib';

import intro from './hitPrediction/intro?scene';
import theProblem from './hitPrediction/theProblem?scene';
import simplifyProblem from './hitPrediction/simplifyProblem?scene';
import movingIssue from './hitPrediction/movingIssue?scene';
import movingIssue2 from './hitPrediction/movingIssue2?scene';
import mainAudio from './hitPrediction/audio/hitPrediction.wav';
import './hitPrediction/styles.css';

export default makeProject({
  scenes: [intro, theProblem, simplifyProblem, movingIssue, movingIssue2],
  background: '#141414',
  audio: mainAudio,
});
