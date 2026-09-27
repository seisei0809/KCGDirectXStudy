// C++ から渡される値。register の番号（b0 / t0 / s0）で C++ 側と対応させる。
cbuffer SceneConstants : register(b0)
{
    float4x4 gWorldViewProjection; // World × View × Projection
};
Texture2D gTexture : register(t0);     // 貼る画像
SamplerState gSampler : register(s0);  // 画像の読み方

// VertexShader が受け取る1頂点。名前の後ろ（POSITION など）は InputLayout の SemanticName と一致させる。
struct VSInput
{
    float3 position : POSITION;
    float4 color : COLOR0;
    float2 uv : TEXCOORD0;
};

// VertexShader から PixelShader へ渡す値。SV_POSITION は画面上の位置として GPU が使う。
struct VSOutput
{
    float4 position : SV_POSITION;
    float4 color : COLOR0;
    float2 uv : TEXCOORD0;
};

// 頂点ごとに1回: 頂点の位置を、行列で画面上の位置へ変換する。
VSOutput VSMain(VSInput input)
{
    VSOutput output;
    output.position = mul(float4(input.position, 1.0f), gWorldViewProjection);
    output.color = input.color;
    output.uv = input.uv;
    return output;
}

// 画素ごとに1回: 画像の色 × 頂点色 を、その画素の色にする。
float4 PSMain(VSOutput input) : SV_TARGET
{
    return gTexture.Sample(gSampler, input.uv) * input.color;
}
