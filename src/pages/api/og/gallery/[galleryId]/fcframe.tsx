/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { NextApiRequest } from 'next';

import { ImageResponse } from '@vercel/og';
import { fetchGraphql } from '../../../../../fetch';
import { fcframeGalleryIdOpengraphQuery } from '../../../../../queries/fcframeGalleryIdOpengraphQuery';
import {
  fallbackImageResponse,
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
} from '../../../../../utils/fallback';
import { ABCDiatypeRegular, ABCDiatypeBold, alpinaLight } from '../../../../../utils/fonts';
import { framePostHandler } from '../../../../../utils/framePostHandler';
import { getPreviewTokens } from '../../../../../utils/getPreviewTokens';
import { generateSplashImageResponse } from '../../../../../utils/splashScreen';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextApiRequest) => {
  // handle POST, where we should return `fcframe` og tags to render the next frame with appropriate buttons
  if (req.method === 'POST') {
    return framePostHandler({ req, frameType: 'GalleryFrame' });
  }

  // handle GET, which should return the raw image for the frame
  try {
    const url = new URL(req.url ?? '');
    const galleryId = url.searchParams.get('galleryId');
    const position = url.searchParams.get('position');

    if (!galleryId || typeof galleryId !== 'string') {
      return fallbackImageResponse;
    }

    console.log('fetching gallery', galleryId);

    const queryResponse = await fetchGraphql({
      queryText: fcframeGalleryIdOpengraphQuery,
      variables: { galleryId },
    });

    const { gallery } = queryResponse.data;

    if (!gallery || gallery?.__typename !== 'Gallery') {
      return fallbackImageResponse;
    }

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    // TODO(Rohan): remove these once we can support these assets
    // temp fix to get the WLTA winner gallery frames working
    const tempIgnoreTokensWithIds = new Set([
      '2bT2G4iiB0LfMVZ6k3YfdiIs8sU',
      '2bT2FzE3iB59Zm5PTUTAhM9lor7',
      '2blxlBBmty8MFX3qLevWqOXorJX',
      '2bhcj7DcaxAROSHodJH99glBt17',
      '2cPoZ0hrNJbaiNsMOvLkeHrfIFc',
      '2bT2FzEWNvgShbVLFwWDMnZ36ud',
      '2cPoYvcYW2xsDoSHhJn9YoMFjY2',
    ]);

    const tokens = gallery.collections
      .filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((el) => el?.token)
      .filter((token) => !tempIgnoreTokensWithIds.has(token?.dbid));

    // if no position is explicitly provided, serve splash image
    let showSplashScreen = !position;

    if (showSplashScreen) {
      return generateSplashImageResponse({
        titleText: gallery.name,
        numSplashImages: 5,
        tokens,
        showUsername: true,
      });
    }

    const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);

    const leftToken = tokensToDisplay?.left;
    const centerToken = tokensToDisplay?.current;
    const rightToken = tokensToDisplay?.right;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            minHeight: 200,
            backgroundColor: '#ffffff',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              position: 'relative',
              marginLeft: '-25%',
              filter: 'blur(6px)',
              opacity: 0.26,
            }}
          >
            {leftToken ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  width="500"
                  height="500"
                  src={leftToken?.src}
                  style={{
                    maxWidth: '500px',
                    maxHeight: '500px',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                  alt="post"
                />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    filter: 'blur(2px)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Regular'",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      margin: 0,
                    }}
                  >
                    {leftToken?.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Bold'",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      margin: 0,
                    }}
                  >
                    {leftToken?.communityName}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',

              position: 'absolute',
              width: '100%',

              height: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <img
                width="500"
                height="500"
                src={centerToken?.src}
                style={{
                  maxWidth: '500px',
                  maxHeight: '500px',
                  display: 'block',
                  objectFit: 'contain',
                }}
                alt="post"
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}
              >
                <p
                  style={{
                    fontFamily: "'ABCDiatype-Regular'",
                    fontSize: '14px',
                    fontWeight: 'light',
                    lineHeight: '20px',
                    margin: 0,
                  }}
                >
                  {centerToken?.name}
                </p>
                <p
                  style={{
                    fontFamily: "'ABCDiatype-Bold'",
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    margin: 0,
                  }}
                >
                  {centerToken?.communityName}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              position: 'relative',
              marginRight: '-25%',
              filter: 'blur(6px)',
              opacity: 0.26,
            }}
          >
            {rightToken ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  width="500"
                  height="500"
                  src={rightToken?.src}
                  style={{
                    maxWidth: '500px',
                    maxHeight: '500px',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                  alt="post"
                />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    filter: 'blur(2px)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Regular'",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      margin: 0,
                    }}
                  >
                    {rightToken?.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Bold'",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      margin: 0,
                    }}
                  >
                    {rightToken?.communityName}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ),
      {
        width: WIDTH_OPENGRAPH_IMAGE,
        height: HEIGHT_OPENGRAPH_IMAGE,
        fonts: [
          {
            name: 'ABCDiatype-Regular',
            data: ABCDiatypeRegularFontData,
            weight: 400,
          },
          {
            name: 'ABCDiatype-Bold',
            data: ABCDiatypeBoldFontData,
            weight: 700,
          },
          {
            name: 'GT Alpina',
            data: alpinaLightFontData,
            style: 'normal',
            weight: 500,
          },
        ],
      },
    );
  } catch (e) {
    console.log('error: ', e);
    return fallbackImageResponse;
  }
};

export default handler;
