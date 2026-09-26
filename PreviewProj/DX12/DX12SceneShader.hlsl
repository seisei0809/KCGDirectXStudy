// DirectX 12 basic shader
// VertexShader は座標変換、PixelShader は Texture Sampling と頂点色の乗算を行います。

cbuffer SceneConstants : register(b0)
{
    float4x4 gWorldViewProjection;
};

Texture2D gTexture : register(t0);
SamplerState gSampler : register(s0);

struct VSInput
{
    float3 position : POSITION;
    float4 color : COLOR0;
    float2 uv : TEXCOORD0;
};

struct VSOutput
{
    float4 position : SV_POSITION;
    float4 color : COLOR0;
    float2 uv : TEXCOORD0;
};

VSOutput VSMain(VSInput input)
{
    VSOutput output;
    output.position = mul(float4(input.position, 1.0f), gWorldViewProjection);
    output.color = input.color;
    output.uv = input.uv;
    return output;
}

float4 PSMain(VSOutput input) : SV_TARGET
{
    return gTexture.Sample(gSampler, input.uv) * input.color;
}
