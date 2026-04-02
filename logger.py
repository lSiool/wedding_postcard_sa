import logging
import sys
from logging import StreamHandler

logger = logging.getLogger(__name__)
logger.addHandler(StreamHandler(sys.stdout))
