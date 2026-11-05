using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;

namespace ThesisAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PredictionController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public PredictionController(
        IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost]
    public async Task<IActionResult> Predict(
        [FromBody] PredictionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Symptoms))
        {
            return BadRequest(new
            {
                error = "Please provide symptoms."
            });
        }

        if (request.Symptoms.Length > 5000)
        {
            return BadRequest(new
            {
                error = "Symptom description is too long."
            });
        }

        try
        {
            var client = _httpClientFactory.CreateClient("Flask");

            var response = await client.PostAsJsonAsync(
                "/predict",
                new { symptoms = request.Symptoms }
            );

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode ==
                    System.Net.HttpStatusCode.BadRequest)
                {
                    var errorResult =
                        await response.Content.ReadFromJsonAsync<
                            Dictionary<string, string>>();

                    var message = errorResult != null &&
                                errorResult.TryGetValue("error", out var error)
                        ? error
                        : "Invalid symptom description.";

                    return BadRequest(new { error = message });
                }

                return StatusCode(502, new
                {
                    error = "Prediction service returned an error."
                });
            }

            var result = await response.Content.ReadFromJsonAsync<object>();

            return Ok(result);
        }
        catch (HttpRequestException)
        {
            return StatusCode(503, new
            {
                error = "Prediction service is unavailable."
            });
        }
        catch (TaskCanceledException)
        {
            return StatusCode(504, new
            {
                error = "Prediction service timed out."
            });
        }
    }
}

public class PredictionRequest
{
    public string Symptoms { get; set; } = string.Empty;
}