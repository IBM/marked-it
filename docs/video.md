# Embedding a video in your docs

We recommend to embed videos in topics with related content rather than as a standalone topic. Having the related content provides more context for your video, and the video enriches the text-based content to provide a multi-modal experience. In comparison, a standalone page only adds marginal value above simply linking to the video. 

## YouTube

1. Add the `{:video: .video}` attribute definition at the top of your Markdown file.
1. Copy the following code and paste it where you want to embed the video.

   ```markdown
   ![Video title](https://www.youtube.com/embed/<video-ID>){: video output="iframe" data-script="none" id="youtubeplayer" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen}
   ```

1. On YouTube, find the video that you want to embed. From the URL, copy the video ID, which is after `v=` in the URL. For example, if the URL is `https://www.youtube.com/watch?v=VXqbRNwXC2A`, the video ID is `VXqbRNwXC2A`.
1. In your Markdown file, paste the video ID into the embed URL in the video path.
1. Add the video title to your Markdown code in the brackets (`[]`).

After all of these steps, your Markdown source to embed the video should look something like so:

```markdown
![Welcome to IBM Cloud](https://www.youtube.com/embed/VXqbRNwXC2A){: video output="iframe" data-script="none" id="youtubeplayer" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen}
```

In your docs, this will embed the video by using the YouTube player. If you'd like to embed an entire playlist, you can modify the embed URL as described in [Embed videos & playlists](https://support.google.com/youtube/answer/171780?hl=en) in the YouTube docs.

> **Important:** If you have more than one video on the page, make sure that the ID (shown as `youtubeplayer` in the sample) is different for each video. Also be sure to include the transcript for each video that is being embedded.


## IBM MediaCenter (Kaltura)

Videos hosted in IBM MediaCenter can have either `mediacenter.ibm.com` URLs (direct links) or `kaltura.com` URLs (embed links).

1. Add the `{:video: .video}` attribute definition at the top of your Markdown file.
1. Copy the following code and paste it where you want to embed the video.

   ```markdown
   ![Video title](https://www.kaltura.com/p/1773841/sp/177384100/embedIframeJs/uiconf_id/27941801/partner_id/1773841?iframeembed=true&entry_id=<video-ID>){: video output="iframe" data-script="none" id="mediacenterplayer" frameborder="0" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen}
   ```

1. Find the video in [IBM MediaCenter](https://mediacenter.ibm.com/) that you want to embed.
1. From the page where the video is displayed, find the video ID at the end of the URL. For example, if you want to embed the video at https://mediacenter.ibm.com/media/1_yy71r4iv, the video ID would be `1_yy71r4iv`.

   If your video link is a `kaltura.com` embed link, the video ID will be the `entry_id` value.
1. In your Markdown file, paste the video ID into the embed URL in the video path.
1. Add the video title to your Markdown code in the brackets (`[]`).

After all of these steps, your Markdown source to embed the video should look something like so:

```markdown
![Why IBM Cloud Paks on IBM Cloud?](https://www.kaltura.com/p/1773841/sp/177384100/embedIframeJs/uiconf_id/27941801/partner_id/1773841?iframeembed=true&entry_id=1_yy71r4iv){: video output="iframe" data-script="none" id="mediacenterplayer" frameborder="0" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen}
```

In your docs, this will embed the video using the MediaCenter player. For a full list of attributes that you can specify for MediaCenter videos, see [MediaCenter - iFrame Embedding](https://pages.github.ibm.com/MediaCenter/docs/player/embed/#tab-iframe).

## Watson Media

1. Add the `{:video: .video}` attribute definition at the top of your Markdown file.
1. Copy the following code and paste it where you want to embed the video.

   ```markdown
   ![Video title](https://video.ibm.com/embed/channel/<channel-id>/video/<video-id>){: video output="iframe" data-script="none" id="watsonmediaplayer" width="560" height="315" scrolling="no" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0" style="border: 0 none transparent;"}
   ```

1. Find the video in Watson Media that you want to embed. You'll need a direct URL to the channel.
1. From the page where the video is displayed, find the channel and video ID at the end of the URL. For example, if you want to embed the video at https://video.ibm.com/channel/23952684/video/security-compliance-intro, the channel ID is `23952684` and the video ID is `security-compliance-intro`. Video IDs can also be numeric, such as `1234567`.
1. In your Markdown file, paste the video ID into the embed URL in the video path.
1. Add the video title to your Markdown code in the brackets (`[]`).

After all of these steps, your Markdown source to embed the video should look something like so:

```markdown
![Introducing the IBM Cloud Security and Compliance Center](https://video.ibm.com/embed/channel/23952684/video/security-compliance-intro){: video output="iframe" data-script="none" id="watsonmediaplayer" width="560" height="315" scrolling="no" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0" style="border: 0 none transparent;"
```

In your docs, this will embed the video using the Watson Media player. 