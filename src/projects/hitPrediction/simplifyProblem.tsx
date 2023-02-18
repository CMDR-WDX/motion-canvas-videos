import {makeScene2D} from '@motion-canvas/2d';
import {Circle, Grid, Image, Latex, Layout, Line, Text} from '@motion-canvas/2d/lib/components';
import {invert} from '@motion-canvas/2d/lib/partials';
import {all, delay, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {easeInOutCubic, easeInOutExpo, easeInOutSine, easeOutElastic, linear} from '@motion-canvas/core/lib/tweening';
import {Vector2} from '@motion-canvas/core/lib/types';
import {createRef, useRandom} from '@motion-canvas/core/lib/utils';
import {createBullet, createTimeDisplayValue, getUpDirectionNormalized} from './util';

const UNIT_LEN = 50;

export default makeScene2D(function* (scene) {
  const root = <Layout />;
  yield scene.add(root);
  const grid = createRef<Grid>();
  const backLayer = (
    <Layout>
      <Grid ref={grid} width={4000} height={4000} cache spacing={UNIT_LEN} lineWidth={1} lineCap="square" stroke={'#444'} opacity={0} />
    </Layout>
  );
  const heading = <Text text={'Simplifying the Problem'} fontSize={100} lineHeight={100} fill="white" y={-600} />;
  yield root.add(backLayer);
  yield root.add(heading);
  yield* heading.position.y(0, 1, easeInOutSine);
  yield* all(grid().opacity(1, 1), heading.opacity(0, 1));
  const inAnimationDuration = 2.4;

  const ourShip = <Circle size={40} position={[-10 * UNIT_LEN * inAnimationDuration, 4 * UNIT_LEN * inAnimationDuration]} fill={'green'} />;
  yield root.add(ourShip);
  yield ourShip.position([0, 0], inAnimationDuration, linear);
  const ourShipDirection = createSignal(new Vector2(10 * UNIT_LEN, -4 * UNIT_LEN));
  const directionLine = (<Line stroke={'darkgreen'} lineWidth={10} opacity={0} endArrow points={[ourShip.position, () => ourShip.position().add(ourShipDirection())]} />) as Line;
  yield backLayer.add(directionLine);
  yield directionLine.opacity(1, 1);
  yield* waitFor(inAnimationDuration);
  directionLine.stroke('#030');
  yield directionLine.opacity(0, 1);
  yield* waitUntil('simplify_bullet_forward');
  for (let i = 0; i < 3; i++) {
    yield createBullet(ourShip.position(), ourShipDirection(), 1.5, backLayer as Layout);
    yield* waitFor(0.2);
  }
  yield* waitUntil('simplify_bullet_all_directions');
  const random = useRandom(589043);
  const shotSpeed = UNIT_LEN * 10;
  for (let i = 0; i < 11; i++) {
    const nextOffset = random.nextInt(0, 360);
    if (i > 5) {
      // Also Spawn Rings
      const timeSinceSpawn = createSignal(0);
      const ring = <Circle stroke={'gray'} lineWidth={5} size={() => timeSinceSpawn() * 2 * shotSpeed} position={ourShip.position} />;
      yield backLayer.add(ring);
      yield timeSinceSpawn(2, 2, linear);
      yield delay(1, ring.opacity(0, 1));
      yield delay(2, () => {
        ring.remove();
      });
    }
    if (i < 9) {
      for (let j = 0; j < 25; j++) {
        const angle = nextOffset + (j / 25) * 360;
        yield createBullet(ourShip.position(), getUpDirectionNormalized(angle).mul(new Vector2(shotSpeed)), 1.5, backLayer as Layout);
      }
    }
    yield* waitFor(1);
  }

  yield root.position.y(400, 1, easeInOutSine);

  yield* waitUntil('simplify_start_talk_collision');
  // From here on the scene is set up relative to a time Variable

  const t = createSignal(0);
  const tText = (<Text opacity={0} fontSize={100} fill={'white'} text={() => `t = ${createTimeDisplayValue(t())}s`} fontFamily={'Ubuntu Mono'} x={600} y={400} />) as Text;
  yield scene.add(tText);
  yield tText.opacity(1, 1);

  const enemyDirection = new Vector2(UNIT_LEN * -5, UNIT_LEN * 1);
  const enemyStartPosition = new Vector2(UNIT_LEN * 16, UNIT_LEN * -15);

  const enemy = <Circle size={40} position={() => enemyStartPosition.add(enemyDirection.mul(new Vector2(t())))} fill={'red'} />;
  const enemyDirectionArrow = <Line stroke={'red'} opacity={0.5} lineWidth={10} endArrow points={[new Vector2(0), enemyDirection]} />;
  const ring = <Circle stroke={'gray'} lineWidth={5} size={() => t() * 2 * shotSpeed} position={ourShip.position} />;
  yield root.add(ring);
  yield enemy.add(enemyDirectionArrow);
  yield root.add(enemy);
  yield* t(1.57, 1.57, linear);
  tText.fill('grey');

  const firstLineCompletion = createSignal(0);
  const distanceSendEnemyLine = (<Line stroke={'yellow'} lineDash={[20, 20]} opacity={0.5} lineWidth={10} startArrow endArrow points={[ourShip.position, enemy.position]} start={() => 0.5 - firstLineCompletion() * 0.5} end={() => 0.5 + firstLineCompletion() * 0.5} />) as Line;

  const secondLineCompletion = createSignal(0);
  const secondLineRotation = createSignal(-45);
  const circleRadius = (<Line stroke={'yellow'} lineDash={[20, 20]} opacity={0.5} lineWidth={10} startArrow endArrow points={[ourShip.position, () => ourShip.position().add(getUpDirectionNormalized(secondLineRotation()).mul(new Vector2(shotSpeed * t())))]} start={() => 0.5 - secondLineCompletion() * 0.5} end={() => 0.5 + secondLineCompletion() * 0.5} />) as Line;

  // Define a container for LaTeX stuff
  const latexContainer = (<Layout y={-400} />) as Layout;
  yield scene.add(latexContainer);

  const latexLeftSide = <Latex x={-500} filters={[invert(1)]} tex={`\\overrightarrow{p}(t)=`} size={300} opacity={0} />;
  const latexStartPosition = <Latex x={-180} filters={[invert(1)]} tex={`\\overrightarrow{p}_\\text{start}`} size={250} opacity={0} />;
  const latexMultiplier = <Latex x={100} filters={[invert(1)]} tex={`+ \\overrightarrow{p}_\\text{dir} \\cdot`} size={300} opacity={0} />;
  const latexT = <Latex x={290} y={30} filters={[invert(1)]} tex={`t`} size={100} opacity={0} />;
  yield latexContainer.add(latexLeftSide);

  yield backLayer.add(distanceSendEnemyLine);
  yield backLayer.add(circleRadius);
  yield* waitUntil('simplify_talk_equal_distance');

  yield firstLineCompletion(1, 1);
  yield* waitUntil('simplify_talk_equal_radius');
  yield* secondLineCompletion(1, 1);
  yield* secondLineRotation(31.2, 2, easeInOutExpo);

  const whereQuestionMark = <Text text={'?'} rotation={10} fontSize={200} lineHeight={200} opacity={0} position={[500, -700]} fill={'white'} />;
  yield root.add(whereQuestionMark);
  yield* waitUntil('simply_talk_before_where');
  yield* all(grid().opacity(0, 0.5), whereQuestionMark.opacity(1, 0.5));
  yield* waitUntil('simply_talk_before_when');
  yield* all(tText.fill('white', 1), tText.scale(2, 1), tText.position([0, 0], 1), delay(0.5, whereQuestionMark.opacity(0, 1)));
  yield latexLeftSide.opacity(1, 1);
  yield* waitFor(0.5);
  yield all(tText.scale(1, 1), tText.position([600, 400], 1));
  const enemyShipOriginMarker = (<Image src={'https://api.iconify.design/maki:cross.svg?color=%23f66151'} size={0} position={enemyStartPosition} />) as Image;
  const enemyPathLine = (<Line end={0} points={[enemyStartPosition, enemyStartPosition.add(enemyDirection.mul(new Vector2(10)))]} stroke={'#f66151a0'} lineWidth={5} />) as Line;
  const enemyOriginTex = createRef<Latex>();
  const enemyDirectionTex = createRef<Latex>();
  const enemyPositionResultTex = createRef<Latex>();
  yield enemyShipOriginMarker.add(<Latex ref={enemyOriginTex} tex={'\\color{gray}\\overrightarrow{p}_\\text{start}=\\Biggl(\\begin{matrix}16\\\\15\\end{matrix}\\Biggr)'} size={300} x={200} y={-100} opacity={0} />);
  yield enemy.add(<Latex ref={enemyDirectionTex} tex={'\\color{gray}\\overrightarrow{p}_\\text{dir}=\\Biggl(\\begin{matrix}-5\\\\-1\\end{matrix}\\Biggr)'} size={300} x={-350} y={-100} opacity={0} />);
  yield enemy.add(<Latex ref={enemyPositionResultTex} tex={() => `\\color{white}\\overrightarrow{p}(${createTimeDisplayValue(t())})=\\Biggl(\\begin{matrix}${Math.round((10 * enemy.position.x()) / UNIT_LEN) / 10}\\\\${Math.round((-10 * enemy.position.y()) / UNIT_LEN) / 10}\\end{matrix}\\Biggr)`} size={500} x={250} y={150} opacity={0} />);
  yield enemyOriginTex().opacity(1, 1);
  yield root.add(enemyShipOriginMarker);
  yield backLayer.add(enemyPathLine);
  yield latexContainer.add(latexStartPosition);
  yield* all(grid().opacity(1, 2), root.position([-300, 600], 2, easeInOutCubic), delay(1, enemyShipOriginMarker.size(40, 1, easeOutElastic)), delay(1, latexStartPosition.opacity(1, 1)), enemyPathLine.end(1, 2), t(0, 1));

  yield* waitUntil('simply_where_flying_toward');
  yield enemyDirectionTex().opacity(1, 1);
  yield delay(1, enemyPositionResultTex().opacity(1, 1));
  yield latexContainer.add(latexMultiplier);
  yield latexMultiplier.opacity(1, 1);
  yield latexContainer.add(latexT);
  yield delay(1, latexT.opacity(1, 1));
  yield* t(1.57, 4);
  yield* all(enemyDirectionTex().opacity(0, 1), enemyOriginTex().opacity(0, 1), tText.opacity(0, 1));
  yield* waitFor(1);
  yield* all(root.opacity(0, 1), latexContainer.opacity(0, 1));

  yield* waitFor(0);
});
