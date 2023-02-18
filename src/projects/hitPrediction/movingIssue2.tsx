import {makeScene2D} from '@motion-canvas/2d';
import {Circle, Grid, Layout, Line, Node, Text} from '@motion-canvas/2d/lib/components';
import {all, any, chain, delay, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {createSignal, Signal, SignalContext, SignalValue, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {cancel} from '@motion-canvas/core/lib/threading';
import {easeOutSine, linear} from '@motion-canvas/core/lib/tweening';
import {Vector2, Vector2Signal} from '@motion-canvas/core/lib/types';
import {createRef, debug, useContext, useLogger, useProject, useRandom} from '@motion-canvas/core/lib/utils';
import {createBullet, createTimeDisplayValue, getUpDirectionNormalized} from './util';

const UNIT_LEN = 100;

export default makeScene2D(function* (scene) {
  const grid = createRef<Grid>();
  const origin = createRef<Circle>();
  const backLayer = (
    <Layout>
      <Grid ref={grid} position={[5 * UNIT_LEN, -3 * UNIT_LEN]} width={4000} height={4000} cache spacing={UNIT_LEN} lineWidth={1} lineCap="square" stroke={'#444'} opacity={0}>
        <Circle ref={origin} size={20} fill={'red'} opacity={0.2}>
          <Line
            points={[
              [0, -4000],
              [0, 4000],
            ]}
            stroke={'red'}
            lineWidth={5}
          />
          <Line
            points={[
              [-4000, 0],
              [4000, 0],
            ]}
            stroke={'red'}
            lineWidth={5}
          />
        </Circle>
      </Grid>
    </Layout>
  );

  const enemy = (<Circle fill={'red'} position={[4 * UNIT_LEN, -3 * UNIT_LEN]} size={0} />) as Circle;
  const enemyDir = (
    <Line
      opacity={0.0}
      stroke={'red'}
      points={[
        [0, 0],
        [1 * UNIT_LEN, 2 * UNIT_LEN],
      ]}
      lineWidth={10}
      endArrow
    />
  );
  yield enemy.add(enemyDir);

  const enemy2 = (<Circle fill={'red'} position={[-7 * UNIT_LEN, 1 * UNIT_LEN]} size={0} />) as Circle;
  const enemy2Dir = (
    <Line
      opacity={0}
      stroke={'red'}
      points={[
        [0, 0],
        [5 * UNIT_LEN, -2 * UNIT_LEN],
      ]}
      lineWidth={10}
      endArrow
    />
  );
  yield enemy2.add(enemy2Dir);

  yield scene.add(enemy);
  yield scene.add(enemy2);

  yield scene.add(backLayer);
  const ourShip = (<Circle fill={'green'} size={0} />) as Circle;
  const ourShipDir = (
    <Line
      opacity={0.0}
      stroke={'green'}
      points={[
        [0, 0],
        [1 * UNIT_LEN, -4 * UNIT_LEN],
      ]}
      lineWidth={10}
      endArrow
    />
  );
  yield ourShip.add(ourShipDir);

  yield scene.add(ourShip);
  yield* all(grid().opacity(1, 1), ourShip.size(60, 1), ourShipDir.opacity(0.5, 1), delay(0.5, all(enemy.size(50, 1), enemy2.size(50, 1), enemyDir.opacity(0.5, 1), enemy2Dir.opacity(0.5, 1))));

  yield* waitUntil('move_origin');
  yield* grid().position(ourShip.position(), 1);

  yield* waitUntil('move_directions');

  const ourShipDir2 = (
    <Line
      opacity={0.5}
      stroke={'blue'}
      points={[
        [0, 0],
        [1 * UNIT_LEN, -4 * UNIT_LEN],
      ]}
      lineWidth={10}
      startArrow
      start={1}
    />
  ) as Line;
  yield ourShip.add(ourShipDir2);
  const enemyDir2 = (
    <Line
      position={[0 * UNIT_LEN, 6 * UNIT_LEN]}
      opacity={0.5}
      stroke={'blue'}
      points={[
        [0, 0],
        [1 * UNIT_LEN, -4 * UNIT_LEN],
      ]}
      lineWidth={10}
      startArrow
      start={1}
    />
  ) as Line;
  yield enemy.add(enemyDir2);
  const enemy2Dir2 = (
    <Line
      position={[4 * UNIT_LEN, 2 * UNIT_LEN]}
      opacity={0.5}
      stroke={'blue'}
      points={[
        [0, 0],
        [1 * UNIT_LEN, -4 * UNIT_LEN],
      ]}
      lineWidth={10}
      startArrow
      start={1}
    />
  ) as Line;
  yield enemy2.add(enemy2Dir2);

  const enemy2Dir3 = (
    <Line
      opacity={0.5}
      stroke={'yellow'}
      points={[
        [0, 0],
        [4 * UNIT_LEN, 2 * UNIT_LEN],
      ]}
      lineWidth={10}
      endArrow
      end={0}
    />
  ) as Line;
  const enemyDir3 = (
    <Line
      opacity={0.5}
      stroke={'yellow'}
      points={[
        [0, 0],
        [0 * UNIT_LEN, 6 * UNIT_LEN],
      ]}
      lineWidth={10}
      endArrow
      end={0}
    />
  ) as Line;

  yield enemy.add(enemyDir3);
  yield enemy2.add(enemy2Dir3);

  yield* all(...[ourShipDir2, enemy2Dir2, enemyDir2].map(e => e.start(0, 1)));

  yield* all(...[enemyDir3, enemy2Dir3].map(e => e.end(1, 1)));

  yield* all(...[ourShipDir, ourShipDir2, enemy2Dir, enemy2Dir2, enemyDir2, enemyDir].map(e => e.opacity(0, 1)));
  for (const entry of [ourShipDir, ourShipDir2, enemy2Dir, enemy2Dir2, enemyDir2, enemyDir]) {
    entry.remove();
  }

  yield* waitFor(5);
});
