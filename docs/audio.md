# Embedding audio files

You can embed audio samples in your docs by using the `{: audio}` extension.

1. Add the `{:audio: .audio}` attribute definition at the top of your Markdown file.
1. Using the typical Markdown image format, `![Alt text](file-name)`, specify the URL or relative path to your audio file. Immediately after, add `{: audio controls}`, which ensures that the audio player displays the controls that are required for accessibility.

   ```markdown
   ![Audio sample title](https://example.com/audio-sample.wav){: audio controls}
   ```

   If your audio isn't one of the [automatically detected audio formats](#audio-types), you'll need to additionally specify the media MIME type, for example: `{: audio controls type="audio/ext"}`.

## Example usage

The following example shows a voice sample embedded in a topic with Markdown markup. 

```markdown
![en-US_KevinV3Voice sample](https://watson-developer-cloud.github.io/doc-tutorial-downloads/text-to-speech/samples-neural/KevinV3.wav){: audio controls}
```

In the docs, this embeds the sample so that users can play it right from the page.

## Accessibility for embedded audio

As with all media types with audio, a text equivalent for the embedded audio must be provided in the surrounding content. This can be as simple as a paragraph before or after the embedded sample that includes the text from the audio sample. 

## Detected audio types

The `{: audio}` extension automatically detects audio files with the following common extensions. If your audio is a different format, you can still embed it - you'll just need to specify `type="audio/ext"` in the `{: audio}` extension.

- `.aif`
- `.aifc`
- `.aiff`
- `.au`
- `.m3u`
- `.mid`
- `.mp3`
- `.mp4`
- `.ogg`
- `.ra`
- `.ram`
- `.snd`
- `.wav`
- `.webm`