import { TextMetrics } from "pixi.js";

/*
    BSD 3-Clause License

    Copyright (c) 2023, prefix.dev GmbH

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

    2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

    3. Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
    OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
export function registerTextMetricsMonkeyPatch() {
    /**
     * This is the original code from pixi with a single modification: when calculating
     * ascent & descent from the drawn canvas it uses `< 240` instead of ` !== 255`. The
     * reason is at least one person has an issue where `fillRect()` adds random artifacts
     * where some pixels are slightly off which causes Pixi to detect those artifacts as text.
     *
     * @source pixi.js@6.0.4
     */

    TextMetrics.measureFont = function (font: string) {
        // as this method is used for preparing assets, don't recalculate things if we don't need to
        if (TextMetrics._fonts[font]) {
            return TextMetrics._fonts[font];
        }
        var properties = {
            ascent: 0,
            descent: 0,
            fontSize: 0,
        };
        var canvas = TextMetrics._canvas;
        var context = TextMetrics._context;
        context.font = font;
        var metricsString = TextMetrics.METRICS_STRING + TextMetrics.BASELINE_SYMBOL;
        var width = Math.ceil(context.measureText(metricsString).width);
        var baseline = Math.ceil(context.measureText(TextMetrics.BASELINE_SYMBOL).width);
        var height = Math.ceil(TextMetrics.HEIGHT_MULTIPLIER * baseline);
        baseline = baseline * TextMetrics.BASELINE_MULTIPLIER | 0;
        canvas.width = width;
        canvas.height = height;
        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);
        context.font = font;
        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText(metricsString, 0, baseline);
        var imagedata = context.getImageData(0, 0, width, height).data;
        var pixels = imagedata.length;
        var line = width * 4;
        var i = 0;
        var idx = 0;
        var stop = false;
        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; ++i) {
            for (var j = 0; j < line; j += 4) {
                if (imagedata[idx + j] < 240) {
                    stop = true;
                    break;
                }
            }
            if (!stop) {
                idx += line;
            }
            else {
                break;
            }
        }
        properties.ascent = baseline - i;
        idx = pixels - line;
        stop = false;
        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; --i) {
            for (var j = 0; j < line; j += 4) {
                if (imagedata[idx + j] < 240) {
                    stop = true;
                    break;
                }
            }
            if (!stop) {
                idx -= line;
            }
            else {
                break;
            }
        }
        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;
        TextMetrics._fonts[font] = properties;
        return properties;
    }
}