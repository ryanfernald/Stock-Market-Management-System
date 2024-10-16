from src.classes.Config import Config


config = Config(
    # Links
    canvas_link="https://sjsu.instructure.com/",
    assignment_links=[
        "https://sjsu.instructure.com/courses/1593846/gradebook/speed_grader?assignment_id=7098312&student_id=4550626",
        "https://sjsu.instructure.com/courses/1593536/gradebook/speed_grader?assignment_id=7097170&student_id=4619005"
    ],
    current_assignment_link="",

    # Flow
    skip_already_graded=False,
    submit_grades=False,
    submit_feedback=False,
    ask_grade_verification=False,

    # Private
    username="017025164",
    password="lillilJeep777***",
    api_key=f"sk-proj-jpZhDGefNGsD8eCJP4sIARYNbEdyLa0TZ-O4lpJLNZnWxrHAWVutYP5IEzKTVhTOr_QuOlbmln"
            f"T3BlbkFJBaGBrA4q4SOcfTPyAGW4xNPhToAp7cvX037rMGMuzUy_gwzzwgE12ICnwhtDdG3-ZFnqEaXsQA",
    # Verbose
    verbose=True,
    grader_verbose_label="Grader: ",
    grader_verbose_color="\033[31m",
    webdrivew_verbose_label="CanvasNavigator: ",
    webdrivew_verbose_color="\033[36m",
    gpt_verbose_label="GPT: ",
    gpt_verbose_color="\033[35m",
    accountant_verbose_label="Accountant: ",
    accountant_verbose_color="\033[32m",
    config_verbose_label="Config: ",
    config_verbose_color="\033[33m",

    # Accountant Params
    reading_speed_per_sec=35,
    typing_speed_per_sec=6,
    pay_rate=19.5,
    out_token_rate=0.15/1000000,
    in_token_rate=0.6/1000000,
    time_multiplier=10,

    # GPT
    model="gpt-4o-mini",
    engagement_assessment_prompt_path="../prompts/engagement_assessment.txt",
    referencing_assessment_prompt_pass="../prompts/referencing_assessment.txt",
    feedback_one_sentence_prompt_path="../prompts/feedback_one_sentence.txt",
    feedback_two_sentence_prompt_path="../prompts/feedback_two_sentence.txt",

    # Other
    logs_dir="../logs",
    level_to_grade_map={"low": 5, "medium": 10, "high": 15}
)
