import {makeScene2D} from '@motion-canvas/2d';
import {Circle, Grid, Layout, Line, Node, Text} from '@motion-canvas/2d/lib/components';
import {all, any, chain, delay, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {createSignal, Signal, SignalContext, SignalValue, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {cancel} from '@motion-canvas/core/lib/threading';
import {linear} from '@motion-canvas/core/lib/tweening';
import {Vector2, Vector2Signal} from '@motion-canvas/core/lib/types';
import {createRef, debug, useContext, useLogger, useProject, useRandom} from '@motion-canvas/core/lib/utils';
import {createBullet, createTimeDisplayValue, getUpDirectionNormalized} from './util';

const UNIT_LEN = 50;

export default makeScene2D(function* (scene) {
  yield* waitUntil('moving_before_talking');
  const title = (<Text fontStyle={'Roboto'} fill={'white'} text={'Problem: Moving Ship'} fontSize={150} lineHeight={200} opacity={0} />) as Text;
  yield scene.add(title);
  yield* title.opacity(1, 1);
  yield* waitFor(1);

  const grid = createRef<Grid>();
  const backLayer = (
    <Layout>
      <Grid ref={grid} width={4000} height={4000} cache spacing={UNIT_LEN} lineWidth={1} lineCap="square" stroke={'#444'} opacity={0} />
    </Layout>
  ) as Layout;

  const root = (<Layout />) as Layout;
  yield root.add(backLayer);

  yield scene.add(root);

  yield* all(title.opacity(0, 1), grid().opacity(1, 1));
  yield title.remove();

  const bulletSpeed = UNIT_LEN * 5;
  const ownShip = (<Circle size={40} position={[-500, 0]} fill={'green'} opacity={0} />) as Circle;
  yield root.add(ownShip);
  yield ownShip.opacity(1, 1);

  const velocity = createSignal(0);
  for (let i = 0; i < 15; i++) {
    let nextOffset = 0;
    if (i > 12) {
      // override to show "reverse"
      nextOffset = useRandom(i).nextInt(80, 100);
    }

    if (i === 3) {
      velocity(0.1);
      yield positionByVelocityUpdater(velocity, ownShip.position);
      //yield all(velocity(1 * UNIT_LEN,1)).next(
      //    yield delay(1, velocity(0, 1))
      //)
      yield animateVelocity(velocity, 5 * UNIT_LEN);
    }

    if (i === 12) {
      velocity(-0.1);
      yield positionByVelocityUpdater(velocity, ownShip.position);
      yield animateVelocity(velocity, -5 * UNIT_LEN);
    }

    if (i === 18) {
      velocity(0.1);
      yield positionByVelocityUpdater(velocity, ownShip.position);
      //yield all(velocity(1 * UNIT_LEN,1)).next(
      //    yield delay(1, velocity(0, 1))
      //)
      yield animateVelocity(velocity, 5 * UNIT_LEN);
    }

    for (let j = 0; j < 10; j++) {
      const angle = nextOffset + (j / 10) * 360;

      const bulletDirection = getUpDirectionNormalized(angle).mul(new Vector2(bulletSpeed)).add(new Vector2(velocity(), 0));

      // Also draw the component sum

      if (j === 0) {
        const points = [ownShip.position(), ownShip.position().add(bulletDirection).add(new Vector2(-velocity(), 0))];
        if (velocity() !== 0) {
          points.push(points[1].add(new Vector2(velocity(), 0)));
        }

        // Please excuse the Spaghetti here
        const line = (<Line points={points} stroke={'grey'} lineWidth={5} endArrow />) as Line;
        yield backLayer.add(line);
        yield chain(waitFor(0.5), line.opacity(0, 0.5), () => line.remove());
        // Create a "merged" line aswell
        if (velocity() != 0) {
          const mergerLine = (<Line points={[points[0], points[2]]} stroke={'grey'} lineWidth={5} />) as Line;
          yield backLayer.add(mergerLine);
          yield chain(waitFor(0.5), mergerLine.opacity(0, 0.5), () => mergerLine.remove());
        }
      }

      const props = j === 0 ? {fill: 'red'} : {};
      yield createBullet(ownShip.position(), bulletDirection, 1.5, backLayer as Layout, props);
    }

    yield* waitFor(1);
  }

  yield* waitFor(1);

  // Animate left-right, but this time with just circles
  yield ownShip.opacity(0, 1);

  const t = createSignal(-2);
  const newShip = (<Circle fill={'green'} size={0} y={-200} />) as Circle;
  const shipMovingXSpeed = 3;
  const newShipMoving = (<Circle x={() => shipMovingXSpeed * UNIT_LEN * t()} fill={'green'} size={0} y={200} />) as Circle;
  const newShipMovingLine = <Line stroke={'green'} lineWidth={5} endArrow points={[() => newShipMoving.position(), () => newShipMoving.position().addX(shipMovingXSpeed * UNIT_LEN)]} opacity={0} />;

  yield root.add(newShip);
  yield root.add(newShipMoving);
  yield root.add(newShipMovingLine);

  const topleft = (<Circle fill={'red'} size={30} x={-400} y={-200} opacity={0} />) as Circle;
  const bottomleft = (<Circle fill={'red'} size={30} x={-400} y={+200} opacity={0} />) as Circle;
  const topRight = (<Circle fill={'red'} size={30} x={+400} y={-200} opacity={0} />) as Circle;
  const bottomRight = (<Circle fill={'red'} size={30} x={+400} y={+200} opacity={0} />) as Circle;
  const verticalLine = (
    <Line
      stroke={'grey'}
      lineWidth={5}
      points={[
        [0, 300],
        [0, -300],
      ]}
      opacity={0}
    />
  );
  for (const entry of [topleft, topRight, bottomleft, bottomRight]) {
    yield root.add(entry);
    yield entry.opacity(1, 1);
  }
  yield backLayer.add(verticalLine);
  yield verticalLine.opacity(1, 1);

  yield all(newShip.size(40, 1), newShipMoving.size(40, 1), newShipMovingLine.opacity(1, 1));

  const bulletText: Text[] = [];
  const bullets: Circle[] = [];
  {
    const tl = (<Circle fill={'white'} opacity={0} y={-200} x={() => t() * -bulletSpeed} size={20} />) as Circle;
    const tr = (<Circle fill={'white'} opacity={0} y={-200} x={() => t() * bulletSpeed} size={20} />) as Circle;
    const br = (<Circle fill={'white'} opacity={0} y={200} x={() => t() * (bulletSpeed + 3 * UNIT_LEN)} size={20} />) as Circle;
    const bl = (<Circle fill={'white'} opacity={0} y={200} x={() => t() * -(bulletSpeed - 3 * UNIT_LEN)} size={20} />) as Circle;

    const tlT = (<Text fill={'white'} opacity={0} y={-300} x={-400} text={'1.60s'} />) as Text;
    const trT = (<Text fill={'white'} opacity={0} y={-300} x={400} text={'1.60s'} />) as Text;
    const brT = (<Text fill={'white'} opacity={0} y={300} x={400} text={'1.00s'} />) as Text;
    const blT = (<Text fill={'white'} opacity={0} y={300} x={-400} text={'4.00s'} />) as Text;

    bulletText.push(tlT, trT, brT, blT);
    bullets.push(tl, tr, br, bl);
    for (const entry of bullets) {
      yield backLayer.add(entry);
    }
    for (const entry of bulletText) {
      yield root.add(entry);
    }
  }

  const tText = <Text fill={'white'} fontSize={100} lineHeight={100} y={450} opacity={0} fontFamily={'Roboto'} text={() => `t=${createTimeDisplayValue(t())}`} />;
  yield root.add(tText);
  yield* waitUntil('moving_difference_example');
  yield tText.opacity(1, 1);

  yield* t(0, 2, linear);

  yield* all(t(4, 4, linear), ...bullets.map(e => e.opacity(1, 0)), delay(1.6, all(bullets[0].opacity(0, 0), bullets[1].opacity(0, 0), bulletText[0].opacity(1, 0), bulletText[1].opacity(1, 0), topleft.fill('blue', 0), topRight.fill('blue', 0))), delay(1, all(bullets[2].opacity(0, 0), bulletText[2].opacity(1, 0), bottomRight.fill('blue', 0))), delay(3, all(newShipMoving.opacity(0, 1), newShipMovingLine.opacity(0, 1))), delay(4, all(bottomleft.fill('blue', 0), bullets[3].opacity(0, 1), bulletText[3].opacity(1, 0))));
  yield* root.opacity(0, 1);
  yield root.removeChildren();
});

function* animateVelocity(velocity: SimpleSignal<number, void>, value: number) {
  yield* velocity(value, 1);
  yield* waitFor(3);
  yield* velocity(0, 1);
}

function* positionByVelocityUpdater(velocity: SimpleSignal<number, void>, position: Vector2Signal<Circle>): Generator<any, void, unknown> {
  while (velocity() != 0) {
    const newPos = position().add(new Vector2(velocity() / useProject().framerate, 0));
    position(newPos);
    yield;
  }
}
