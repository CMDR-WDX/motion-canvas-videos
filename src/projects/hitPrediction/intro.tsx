import {Layout, Line, Node, Text} from '@motion-canvas/2d/lib/components';
import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {easeInOutQuint} from '@motion-canvas/core/lib/tweening';

export default makeScene2D(function* (scene) {
  const firstLineStart = createSignal(0);
  const firstLineEnd = createSignal(0);
  const secondLineStart = createSignal(0);
  const secondLineEnd = createSignal(0);

  const secondLineMaskOpacity = createSignal(0);
  yield* waitUntil('intro_start_talking');
  scene.add(
    <Layout>
      <Node cache>
        <Text
          position={[-500, -200]}
          text={'Hit'}
          textWrap="pre"
          fontFamily={'Roboto'}
          fill={'white'}
          fontSize={300}
          fontWeight={900}
        />
        <Line
          compositeOperation={'source-out'}
          start={firstLineStart}
          end={firstLineEnd}
          stroke={'#eee'}
          lineWidth={300}
          points={[
            [-750, -230],
            [-250, -200],
          ]}
        />
      </Node>
      <Node cache>
        <Text
          position={[0, +100]}
          text={'Prediction'}
          textWrap="pre"
          fontFamily={'Roboto'}
          fill={'white'}
          fontSize={300}
          fontWeight={900}
        />
        <Line
          compositeOperation={'source-out'}
          start={secondLineStart}
          end={secondLineEnd}
          stroke={'dcd'}
          lineWidth={300}
          points={[
            [-750, +100],
            [750, +50],
          ]}
        />
      </Node>

      {/* Text for "after" the stroke is gone */}

      <Node opacity={secondLineMaskOpacity} cache>
        <Text
          position={[-500, -200]}
          text={'Hit'}
          textWrap="pre"
          fontFamily={'Roboto'}
          fill={'white'}
          fontSize={300}
          fontWeight={900}
        />
        <Line
          compositeOperation={'destination-in'}
          start={0}
          end={() => firstLineStart() - 0.001}
          stroke={'#eee'}
          lineWidth={300}
          points={[
            [-750, -230],
            [-250, -200],
          ]}
        />
      </Node>
      <Node opacity={secondLineMaskOpacity} cache>
        <Text
          position={[0, +100]}
          lineHeight={300}
          text={'Prediction'}
          textWrap="pre"
          fontFamily={'Roboto'}
          fill={'white'}
          fontSize={300}
          fontWeight={900}
        />
        <Line
          compositeOperation={'destination-in'}
          start={0}
          end={() => secondLineStart() - 0.001}
          stroke={'1cd'}
          lineWidth={300}
          points={[
            [-750, +100],
            [750, +50],
          ]}
        />
      </Node>
    </Layout>,
  );
  yield firstLineEnd(1, 1, easeInOutQuint);
  yield* waitFor(0.1);
  yield secondLineEnd(1, 0.7, easeInOutQuint);

  yield* waitFor(2);
  secondLineMaskOpacity(1);
  yield firstLineStart(1, 1, easeInOutQuint);
  yield* waitFor(0.2);
  yield secondLineStart(1, 0.7, easeInOutQuint);
  yield* waitFor(5);
});
