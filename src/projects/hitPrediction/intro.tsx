import {Image, Layout, Line, Node, Text, Video, View2D} from '@motion-canvas/2d/lib/components';
import {blur, brightness} from '@motion-canvas/2d/lib/partials';
import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all, delay, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {easeInOutQuint, easeInOutSine, easeOutBack} from '@motion-canvas/core/lib/tweening';
import {createRef, Reference} from '@motion-canvas/core/lib/utils';

import ytScreen from './img/intro/yt_screen.png';
import ytThumbGoopTroop from './img/intro/gooptroop.webp';
import ytThumbMassacre from './img/intro/massacre.jpg';
import ytThumbDictor from './img/intro/dictor.webp';
import ytThumbPower from './img/intro/powerprios.jpg';
import ytThumbShards from './img/intro/shards.jpg';
import ytThumbSelenium from './img/intro/selenium.webp';
import {Random} from '@motion-canvas/core/lib/scenes';
import {Vector2} from '@motion-canvas/core/lib/types';

import introBRoll from './video/broll.mp4';

function* makeIntroTitle(scene: View2D, layoutRef: Reference<Layout>) {
  const firstLineStart = createSignal(0);
  const firstLineEnd = createSignal(0);
  const secondLineStart = createSignal(0);
  const secondLineEnd = createSignal(0);

  const titleFirstLineRef = createRef<Node>();
  const titleSecondLineRef = createRef<Node>();

  const secondLineMaskOpacity = createSignal(0);

  yield* waitUntil('intro_start_talking');
  scene.add(
    <Layout ref={layoutRef}>
      <Node ref={titleFirstLineRef} cache>
        <Text position={[-500, -200]} text={'Hit'} textWrap="pre" fontFamily={'Roboto'} fill={'white'} fontSize={300} fontWeight={900} />
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
      <Node ref={titleSecondLineRef} cache>
        <Text position={[0, +100]} text={'Prediction'} textWrap="pre" fontFamily={'Roboto'} fill={'white'} fontSize={300} fontWeight={900} />
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
        <Text position={[-500, -200]} text={'Hit'} textWrap="pre" fontFamily={'Roboto'} fill={'white'} fontSize={300} fontWeight={900} />
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
        <Text position={[0, +100]} lineHeight={300} text={'Prediction'} textWrap="pre" fontFamily={'Roboto'} fill={'white'} fontSize={300} fontWeight={900} />
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
  yield secondLineMaskOpacity(1);
  yield firstLineStart(1, 1, easeInOutQuint);
  yield* waitFor(0.2);
  yield* secondLineStart(1, 0.7, easeInOutQuint);
  // Delete no longer relevant Nodes used to create the strokes
  titleFirstLineRef().remove();
  titleSecondLineRef().remove();
}

function* makeMathWarning(scene: View2D) {
  const mathWarning = (
    <Layout position={[350, 650]} layout opacity={0.5} alignItems={'center'} direction={'row'}>
      {/* removing line below fixes Rendering */}
      <Image size={100} marginTop={-20} marginRight={40} src="https://api.iconify.design/material-symbols:warning-rounded.svg?color=%23f6f5f4" />
      <Text fontSize={100} lineHeight={100} fill={'#f6f5f4'} text={'Warning: Math ahead'} />
    </Layout>
  );

  scene.add(mathWarning);

  yield* mathWarning.position([350, 450], 1, easeInOutQuint);

  yield* waitUntil('intro_disclaimer_not_scared');
  yield* mathWarning.opacity(0, 1);
  yield mathWarning.remove();
}

export default makeScene2D(function* (scene) {
  const titleLayout = createRef<Layout>();

  yield* all(makeIntroTitle(scene, titleLayout), delay(1, makeMathWarning(scene)));

  yield* waitUntil('intro_what_hitprediction');

  // Add quotes around text
  const quoteLeftSize = createSignal(0);
  const quoteRightSize = createSignal(0);
  const quoteLeft = <Text fill={'white'} fontSize={quoteLeftSize} lineHeight={() => (quoteLeftSize() == 0 ? 1 : quoteLeftSize())} text="“" position={[-780, -200]} />;
  const quoteRight = <Text fill={'white'} fontSize={quoteRightSize} lineHeight={() => (quoteRightSize() == 0 ? 1 : quoteRightSize())} text="”" position={[800, 100]} />;
  titleLayout().add(
    <>
      {quoteLeft}
      {quoteRight}
    </>,
  );

  yield quoteLeftSize(400, 0.5, easeOutBack);
  yield* waitFor(0.2);
  yield* quoteRightSize(400, 0.5, easeOutBack);
  yield* waitUntil('intro_swipe_youtube');
  const ytScreenNode = createRef<Layout>();
  const ytScreenNodePrimary = createRef<Image>();
  const ytScreenNodePrimaryFilterSlider = createSignal(0);
  scene.add(
    <Layout ref={ytScreenNode} position={[0, 1250]}>
      <Image ref={ytScreenNodePrimary} filters={[blur(ytScreenNodePrimaryFilterSlider), brightness(() => 1 - ytScreenNodePrimaryFilterSlider() * 0.1)]} src={ytScreen} />
    </Layout>,
  );

  const thumbnailImages = [ytThumbGoopTroop, ytThumbDictor, ytThumbMassacre, ytThumbPower, ytThumbShards, ytThumbSelenium].map((src, index) => <Image antialiased opacity={1} src={src} size={[210, 210 * (9 / 16)]} position={[-417 + index * 213.6, -96]} />);
  ytScreenNode().add(thumbnailImages);

  yield* all(yield titleLayout().position([titleLayout().position().x, -800], 1, easeInOutQuint), yield ytScreenNode().position([0, 0], 1, easeInOutQuint));

  yield* waitFor(0.5);

  yield ytScreenNodePrimaryFilterSlider(8, 0.5);
  const random = new Random(492);
  for (const el of thumbnailImages) {
    yield el.scale(random.nextFloat(1.1, 3), 0.5, easeInOutQuint);
    yield el.rotation(random.nextFloat(-23, 20), 0.5, easeInOutQuint);
    const currentPos = el.position();
    const newPosition = new Vector2(currentPos.x + random.nextFloat(-20, 20), currentPos.y + random.nextFloat(-200, 200));

    yield delay(0.5, yield el.position(newPosition, random.nextFloat(0.4, 0.5), easeInOutSine));
  }

  for (const thumb of thumbnailImages) {
    yield handleIndividualThumbnail(thumb as Image, random.nextInt());
  }

  yield* waitUntil('intro_swipe_to_ed_broll');
  // Move thumbs and background upwards, reveal E:D b-roll

  const thumbOutAnimation = [];
  for (const thumb of thumbnailImages) {
    thumbOutAnimation.push(thumb.position.y(random.nextInt(-900, -1000), 3, easeInOutQuint));
  }
  // create the B-Roll node, but move it to the start of the scene so it gets rendered in the back
  const bRollBlur = createSignal(0);
  const bRollVid: Video = (<Video filters={[blur(bRollBlur)]} opacity={0} src={introBRoll} />) as Video;
  yield scene.insert(bRollVid);
  bRollVid.play();
  yield ytScreenNodePrimary().position.y(-(3 * 1080) / 2, 3, easeInOutQuint);
  yield* all(...thumbOutAnimation, bRollVid.opacity(1, 1));
  ytScreenNode().removeChildren();
  ytScreenNode().remove();
  yield* waitUntil('intro_broll_end');
  yield bRollBlur(10, 0.5);
  yield* bRollVid.opacity(0, 0.5);
  yield bRollVid.pause();
});

function* handleIndividualThumbnail(node: Image, seed: number) {
  const random = new Random(seed);
  yield* waitFor(random.nextFloat(0, 0.5));
  yield node.scale(1.5, 0.5), yield node.rotation(random.nextInt(-20, 20), 0.5, easeInOutQuint);
  const currentPos = node.position();
  const newPosition = new Vector2(currentPos.x + random.nextFloat(-20, 20), currentPos.y + random.nextFloat(-20, 20));
  yield node.position(newPosition, random.nextFloat(0.1, 0.5));
}
