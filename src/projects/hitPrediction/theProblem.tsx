import {makeScene2D} from '@motion-canvas/2d';
import {Circle, Image, Layout, Line, Rect, Text} from '@motion-canvas/2d/lib/components';
import {all, delay, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {createComputed, createSignal} from '@motion-canvas/core/lib/signals';
import {useTransition} from '@motion-canvas/core/lib/transitions';
import {easeInCubic, easeInOutBack, easeInOutCirc, easeInOutElastic, easeInOutQuad, easeInOutQuint, easeInOutSine, easeOutBack, easeOutBounce, easeOutElastic, easeOutSine, linear} from '@motion-canvas/core/lib/tweening';
import {Vector2} from '@motion-canvas/core/lib/types';
import {debug, useLogger} from '@motion-canvas/core/lib/utils';
import {getUpDirectionNormalized} from './util';

export default makeScene2D(function* (scene) {
  const title = <Text y={-70} fill={'#fff'} scale={1} fontSize={180} lineHeight={400} fontFamily={'Roboto'} opacity={0} text={'Defining the Problem'} />;
  const subtitle1 = <Text fill={'#fff'} scale={1} fontFamily={'Roboto'} opacity={0} text={'What do we want to achieve?'} />;
  const subtitle2 = <Text fill={'#fff'} scale={1} fontFamily={'Roboto'} opacity={0} text={'What information can we work with?'} />;
  const titleLayout = (
    <Layout y={50}>
      {title}
      <Layout y={40} layout gap={50} direction={'row'}>
        {subtitle1}
        {subtitle2}
      </Layout>
    </Layout>
  );

  const backLayer = <Layout />;
  scene.add(backLayer);
  scene.add(titleLayout);
  yield* waitUntil('problem_start_talk');
  yield* title.opacity(1, 1);
  yield* waitFor(1);
  yield* all(subtitle1.opacity(1, 1), delay(0.2, subtitle2.opacity(1, 1)));
  // This is used for placing shots behind the ship

  const ownShip = <Image y={-740} src={'https://api.iconify.design/ri:space-ship-fill.svg?color=%2357e389'} size={200} />;
  yield titleLayout.add(ownShip);
  // Parent the next section of the scene to the title so it moves at the same speed.
  yield titleLayout.position.y(780, 2, easeInOutBack);
  yield* waitUntil('problem_gun_intro');
  ownShip.reparent(scene);
  const gunForShipSize = createSignal(new Vector2(0, 0));
  const gunForShip = <Rect size={gunForShipSize} y={-60} fill={'green'} />;
  ownShip.add(gunForShip);
  yield* gunForShipSize(new Vector2(40, 100), 0.6, easeOutBack);

  yield* waitUntil('problem_gun_spin_shot');
  yield ownShip.rotation(360, 2);

  // Shoot the gun ever .2s for 2 Seconds = 10 Shots
  for (let i = 0; i < 10; i++) {
    const shotDirection = getUpDirectionNormalized(ownShip.rotation()).mul(new Vector2(100));
    const bullet = <Circle fill={'#fff'} size={20} position={ownShip.position().add(shotDirection)} />;
    yield bullet.position(ownShip.position().add(shotDirection.mul(new Vector2(15))), 3, linear);
    yield delay(0.5, bullet.scale(0, 1, easeOutSine));
    backLayer.add(bullet);
    yield* waitFor(0.2);
  }

  yield* waitUntil('problem_enemy_intro');
  // Kill the bullets
  const enemyShip: Image = (<Image y={-600} x={900} rotation={-105} src={'https://api.iconify.design/ri:space-ship-fill.svg?color=%23f55'} size={0} />) as Image;
  scene.add(enemyShip);
  yield enemyShip.size(200, 0.7, easeOutBack);
  yield enemyShip.position(enemyShip.position().add(getUpDirectionNormalized(enemyShip.rotation()).mul(new Vector2(2100))), 4, linear);
  yield* waitFor(3);
  backLayer.removeChildren();
  yield* ownShip.position.y(400, 1, easeInOutSine);
  yield enemyShip.position([900, -600]);
  yield* waitFor(1);
  yield enemyShip.position(enemyShip.position().add(getUpDirectionNormalized(enemyShip.rotation()).mul(new Vector2(2100))), 6, linear);
  const directionLines = [];
  const leftBound = createSignal(-70);
  const rightBound = createSignal(0);
  for (let i = 0; i < 6; i++) {
    const directionVector = () => {
      const direction = (rightBound() - leftBound()) * (i / 5) + leftBound();
      return getUpDirectionNormalized(direction);
    };
    const secondPoint = () => {
      return ownShip.position().add(directionVector().mul(new Vector2(1200)));
    };
    const line = (<Line lineCap={'round'} lineDash={[50, 50]} end={0} stroke={'gray'} lineWidth={10} points={[() => ownShip.position().add(directionVector().mul(new Vector2(100))), secondPoint]} />) as Line;
    backLayer.add(line);
    directionLines.push(line);
    yield line.start(1, 1, easeInCubic);
  }

  yield* all(ownShip.rotation(290, 5, easeInOutSine), leftBound(-85, 5, linear), rightBound(-45, 5, linear));

  yield gunForShip.opacity(0, 1);

  yield* all(...directionLines.map(e => e.opacity(0, 0.5)), enemyShip.opacity(0, 0.5));
  yield* waitUntil('problem_define_inputs');
  enemyShip.opacity(1);
  enemyShip.size([0, 0]);

  const ownPosition = (<Circle position={ownShip.position} size={0} fill={'green'} />) as Circle;
  scene.add(ownPosition);
  const ownDirectionLen = createSignal(1);
  yield* ownPosition.size([50, 50], 1, easeInOutCirc);
  const ownDirection = <Line stroke={'green'} lineWidth={12} endArrow points={[ownShip.position, () => ownPosition.position().add(getUpDirectionNormalized(ownShip.rotation()).mul(new Vector2(ownDirectionLen())))]} />;
  scene.add(ownDirection);
  yield* waitFor(0.2);
  yield* ownDirectionLen(200, 1, easeOutBack);
  yield* waitFor(0.5);
  enemyShip.position([400, -400]);
  yield enemyShip.size([200, 200], 0.5, easeInOutCirc);
  const enemyPosition = (<Circle position={enemyShip.position} size={0} fill={'darkred'} />) as Circle;
  scene.add(enemyPosition);
  yield* waitFor(0.5);
  yield enemyPosition.size([50, 50], 0.5, easeInOutCirc);
  const enemyDirectionLen = createSignal(1);
  const enemyDirection = <Line stroke={'darkred'} lineWidth={12} endArrow points={[enemyShip.position, () => enemyShip.position().add(getUpDirectionNormalized(enemyShip.rotation()).mul(new Vector2(enemyDirectionLen())))]} />;
  scene.add(enemyDirection);
  yield enemyDirectionLen(500, 1, easeOutBack);
  yield* waitFor(0.5);

  // Create one Shot
  for (let i = 0; i < 10; i++) {
    const shotDirection = getUpDirectionNormalized(ownShip.rotation()).mul(new Vector2(100));
    const bullet = <Circle fill={'#fff'} size={20} position={ownShip.position().add(shotDirection)} />;
    yield bullet.position(ownShip.position().add(shotDirection.mul(new Vector2(15))), 3, linear);
    yield delay(0.5, bullet.scale(0, 2, easeOutSine));
    backLayer.add(bullet);
    yield* waitFor(0.1);
    if (i === 10 - 1) {
      yield* waitFor(0.15);
      const lineOffset = getUpDirectionNormalized(ownShip.rotation() + 90).mul(new Vector2(50));
      const shotSpeedIndicator = <Line stroke={'gray'} lineWidth={12} endArrow points={[bullet.position().add(lineOffset), () => bullet.position().add(lineOffset)]} />;
      backLayer.add(shotSpeedIndicator);
    }
  }

  yield* all(backLayer.opacity(0, 1), ...scene.children().map(e => e.opacity(0, 1)));
});
