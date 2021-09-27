import React, { memo, useMemo, useState } from 'react';
import { Link } from 'gatsby';
import cn from 'classnames';

import Tabs from '../Tabs';
import Tags from './Tags';

import * as css from './TrackVideoPlayer.module.css';

const TrackVideoPlayer = ({ track, video, trackPosition }) => {
  const { chapters } = track;
  const [showTimestamps, setShowTimestamps] = useState(false);
  const { topics, languages } = video;
  return (
    <div className={css.root}>
      <div className={css.subheading}>
        <h2>{video.title}</h2>
      </div>
      <div className={css.videoPlayer}>
        <div className={css.left}>
          <div className={css.details}>
            <Tags className={css.tags} heading="Languages" items={languages} />
            <Tags className={css.tags} heading="Topics" items={topics} />
          </div>
          <div className={css.video}></div>
        </div>
        <div className={css.right}>
          <div className={css.tabs}>
            <div className={cn(css.tab, { [css.selected]: !showTimestamps })}>
              <button onClick={() => setShowTimestamps(false)}>
                Track overview
              </button>
            </div>
            <div className={cn(css.tab, { [css.selected]: showTimestamps })}>
              <button onClick={() => setShowTimestamps(true)}>
                Video timestamps
              </button>
            </div>
          </div>
          <div className={css.timeline}>
            {showTimestamps ? (
              <VideoTimestampsTimeline />
            ) : (
              <TrackOverViewTimeline
                chapters={chapters}
                track={track}
                trackPosition={trackPosition}
              />
            )}
          </div>
        </div>
      </div>
      <div className={css.sep}></div>
      <div className={css.about}>
        <Tabs
          variant="red"
          labels={['OVERVIEW', 'CODE EXAMPLES', 'LINKS DISCUSSED']}>
          <div className={css.description}>
            <p>{video.description}</p>
          </div>
          <div></div>
          <div></div>
        </Tabs>
      </div>
    </div>
  );
};

const TrackOverViewTimeline = ({ chapters, track, trackPosition }) => {
  const nextVideoPath = useMemo(() => {
    if (
      trackPosition.chapterIndex === chapters.length - 1 &&
      trackPosition.videoIndex ===
        chapters[chapters.length - 1].videos.length - 1
    )
      return '';
    if (
      trackPosition.videoIndex ===
      chapters[trackPosition.chapterIndex].videos.length - 1
    ) {
      const video = chapters[trackPosition.chapterIndex + 1].videos[0];
      return `/tracks/${track.slug}/${video.slug}`;
    }
    const video =
      chapters[trackPosition.chapterIndex].videos[trackPosition.videoIndex + 1];
    return `/tracks/${track.slug}/${video.slug}`;
  }, []);
  const previousVideoPath = useMemo(() => {
    if (trackPosition.chapterIndex === 0 && trackPosition.videoIndex === 0)
      return '';
    if (trackPosition.videoIndex === 0) {
      const video =
        chapters[trackPosition.chapterIndex - 1].videos[
          chapters[trackPosition.chapterIndex - 1].videos.length - 1
        ];
      return `/tracks/${track.slug}/${video.slug}`;
    }
    const video =
      chapters[trackPosition.chapterIndex].videos[trackPosition.videoIndex - 1];
    return `/tracks/${track.slug}/${video.slug}`;
  }, []);

  return (
    <div className={css.trackTimelineContainer}>
      <div className={css.trackTimeline}>
        {chapters.map((chapter, index) => (
          <ChapterSection
            key={chapter.title}
            chapter={chapter}
            chapterIndex={index}
            track={track}
            trackPosition={trackPosition}
            startsCollapsed={trackPosition.chapterIndex < index}
          />
        ))}
      </div>
      <div className={css.trackNavigation}>
        <Link
          className={cn({ [css.disabled]: previousVideoPath !== '' })}
          to={previousVideoPath}>
          Previous
        </Link>
        <Link
          className={cn({ [css.disabled]: nextVideoPath !== '' })}
          to={nextVideoPath}>
          Next
        </Link>
      </div>
    </div>
  );
};

const ChapterSection = ({
  startsCollapsed = true,
  chapter,
  chapterIndex,
  track,
  trackPosition
}) => {
  const [collapsed, setCollapsed] = useState(startsCollapsed);
  return (
    <ul className={css.chapterList} key={chapter.title}>
      <h5
        className={cn(
          css.chapterTitle,
          { [css.notCollapsed]: !collapsed },
          { [css.hasSeen]: chapterIndex <= trackPosition.chapterIndex }
        )}
        onClick={() => setCollapsed((c) => !c)}>
        {chapter.title}
      </h5>
      {!collapsed &&
        chapter.videos.map((video, index) => (
          <li
            key={video.slug}
            className={cn(css.videoItem, {
              [css.seen]:
                chapterIndex < trackPosition.chapterIndex ||
                (chapterIndex === trackPosition.chapterIndex &&
                  index <= trackPosition.videoIndex),
              [css.last]:
                (chapterIndex < trackPosition.chapterIndex &&
                  index === track.chapters[chapterIndex].videos.length - 1) ||
                (chapterIndex === trackPosition.chapterIndex &&
                  index === trackPosition.videoIndex)
            })}>
            <Link to={`/tracks/${track.slug}/${video.slug}`}>
              {video.title}
            </Link>
          </li>
        ))}
    </ul>
  );
};

const VideoTimestampsTimeline = () => null;

export default memo(TrackVideoPlayer);
