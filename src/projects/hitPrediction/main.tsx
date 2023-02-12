import { Rect } from '@motion-canvas/2d/lib/components';
import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {waitFor} from '@motion-canvas/core/lib/flow';


export default makeScene2D(function* (view) {
  // Create your animations here
  view.add(
    <Rect size={[40, 40]} fill="blue" />
  )
  yield* waitFor(5);
});
